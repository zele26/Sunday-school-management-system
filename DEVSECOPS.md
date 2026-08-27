# DevSecOps Enterprise Setup & Operator Guide

This document provides a step-by-step installation, integration, and operational guide for the **Sunday School Management System** DevSecOps pipeline using **Git (GitHub), Jenkins, Webhook, Harbor, HashiCorp Vault, ArgoCD, and Red Hat OpenShift**.

---

## Architecture Blueprint

```
+---------------------------------------------------------------------------------------------------+
|                                     DEVSECOPS PIPELINE                                            |
+---------------------------------------------------------------------------------------------------+
|  1. GitHub      --> Webhook triggers Jenkins build on Push / Pull Request                       |
|  2. HashiCorp   --> Jenkins retrieves short-lived build credentials dynamically                     |
|     Vault                                                                                         |
|  3. Jenkins CI  --> Runs Unit Tests, SAST (SonarQube), SCA (Dependency Audit)                     |
|  4. Build & Scan--> Multi-stage Docker build -> Trivy Container Vulnerability Scan               |
|  5. Harbor      --> Pushes validated OCI images to enterprise Harbor registry                     |
|  6. Cosign      --> Cryptographically signs container images                                      |
|  7. GitOps Sync --> Updates image tags in Git k8s-manifests                                       |
|  8. ArgoCD      --> Auto-syncs updated manifests to OpenShift cluster                             |
|  9. OpenShift   --> Runs pods under restricted-v2 SCC, pulling runtime secrets from Vault via ESO |
+---------------------------------------------------------------------------------------------------+
```

---

## 1. HashiCorp Vault Configuration

### Step 1.1: Enable KV Secrets Engine v2
```bash
# Log in to Vault CLI
vault login <your-vault-token>

# Enable KV v2 engine at secret/
vault secrets enable -path=secret kv-v2
```

### Step 1.2: Store Production Environment Secrets
```bash
vault kv put secret/church-project/production \
  MONGO_URI="mongodb+srv://<db_user>:<db_password>@cluster.mongodb.net/church_db" \
  JWT_SECRET="<your-jwt-secret-key>" \
  REFRESH_TOKEN_SECRET="<your-refresh-token-secret-key>" \
  CLOUDINARY_CLOUD_NAME="<your-cloudinary-cloud-name>" \
  CLOUDINARY_API_KEY="<your-cloudinary-api-key>" \
  CLOUDINARY_API_SECRET="<your-cloudinary-api-secret>"
```

### Step 1.3: Enable Kubernetes Authentication for OpenShift
```bash
# Enable Kubernetes auth method
vault auth enable kubernetes

# Configure Vault to connect to OpenShift API server
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc:443"

# Create policy for backend secrets
vault policy write church-backend-policy - <<EOF
path "secret/data/church-project/production" {
  capabilities = ["read"]
}
EOF

# Bind policy to OpenShift service account
vault write auth/kubernetes/role/church-backend-role \
  bound_service_account_names=default \
  bound_service_account_namespaces=church-production \
  policies=church-backend-policy \
  ttl=1h
```

---

## 2. Harbor Container Registry Setup

1. **Create Harbor Project**:
   - Log in to your Harbor UI (`https://harbor.yourdomain.com`).
   - Create a project named **`church-project`** (Access Level: Private).

2. **Create Robot Account**:
   - Go to **Projects** > **church-project** > **Robot Accounts**.
   - Create a robot account: `robot$jenkins-ci`.
   - Permissions: `Push Repository`, `Pull Repository`.
   - Copy the generated Secret Token for Jenkins configuration.

3. **Configure Image Vulnerability Policy**:
   - Under **Project Settings**, enable **"Prevent vulnerable images from running"** with threshold set to `CRITICAL`.
   - Enable **"Scan on push"**.

---

## 3. Jenkins CI Setup & Webhook

### Step 3.1: Install Required Jenkins Plugins
Ensure the following plugins are installed in Jenkins (*Manage Jenkins > Plugins*):
- `Pipeline`
- `GitHub Plugin`
- `Docker Pipeline`
- `HashiCorp Vault Plugin`
- `SonarQube Scanner`
- `AnsiColor`

### Step 3.2: Configure Credentials in Jenkins
Navigate to *Manage Jenkins > Credentials > System > Global credentials*:

| Credential ID | Type | Description / Value |
|---|---|---|
| `vault-approle-credentials` | Username with Password | Vault Role ID & Secret ID |
| `harbor-robot-credentials` | Username with Password | Harbor Robot Account Name & Secret Token |
| `sonarqube-token` | Secret text | SonarQube User Authentication Token |
| `cosign-private-key-passphrase` | Secret text | Passphrase for Cosign key |
| `github-gitops-pat` | Username with Password | GitHub Personal Access Token (`repo` scope) |

### Step 3.3: Configure GitHub Webhook
1. Go to your GitHub repository: `https://github.com/zele26/Sunday-school-management-system`.
2. Go to **Settings** > **Webhooks** > **Add webhook**.
3. **Payload URL**: `https://<jenkins-url>/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Select *Just the push event* and *Pull requests*.
6. Click **Add webhook**.

---

## 4. ArgoCD Setup on OpenShift

### Step 4.1: Install ArgoCD Operator
```bash
# Create argocd namespace
oc new-project argocd

# Apply ArgoCD instance
oc apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Step 4.2: Apply Application Manifests
Deploy ArgoCD Application CRDs to sync manifests automatically:
```bash
# Apply Backend ArgoCD Application
oc apply -f k8s-manifests/argocd/application-backend.yaml

# Apply Frontend ArgoCD Application
oc apply -f k8s-manifests/argocd/application-frontend.yaml
```

### Step 4.3: Grant ArgoCD Namespace Access to OpenShift Project
```bash
# Allow ArgoCD to manage resources in church-production namespace
oc adm policy add-role-to-user admin system:serviceaccount:argocd:argocd-application-controller -n church-production
```

---

## 5. OpenShift Security & Deployment

### Step 5.1: Create Production Namespace & Image Pull Secret
```bash
# Create target namespace
oc new-project church-production

# Create secret for Harbor registry access
oc create secret docker-registry harbor-pull-secret \
  --docker-server=harbor.yourdomain.com \
  --docker-username='robot$jenkins-ci' \
  --docker-password='<HARBOR-ROBOT-TOKEN>' \
  --docker-email='devsecops@yourdomain.com' \
  -n church-production
```

### Step 5.2: Apply External Secrets Operator Manifest
```bash
oc apply -f k8s-manifests/vault/external-secret-backend.yaml
```

---

## 6. Verification Checklist

- [x] **Jenkins Pipeline**: Code pushes trigger `Jenkinsfile` automatically.
- [x] **SAST/SCA Scans**: Code analyzed by SonarQube & `npm audit`.
- [x] **Container Security**: Built images scanned by Trivy before Harbor push.
- [x] **Registry Gate**: Harbor receives tagged image (`<build-number>-<commit-hash>`).
- [x] **GitOps Automation**: Jenkins updates `k8s-manifests/` image tag and commits to Git.
- [x] **ArgoCD Sync**: ArgoCD detects Git change and deploys to OpenShift cleanly.
- [x] **Vault Secrets**: OpenShift backend pods start using secrets dynamically fetched from Vault.
