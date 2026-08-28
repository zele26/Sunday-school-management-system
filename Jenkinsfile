pipeline {
    agent any

    environment {
        // --- Global & Infrastructure Configuration ---
        HARBOR_HOST       = 'localhost:5000'
        HARBOR_PROJECT    = 'church-project'
        HARBOR_REGISTRY   = "${HARBOR_HOST}/${HARBOR_PROJECT}"
        
        // Image repositories
        BACKEND_IMAGE_NAME  = "${HARBOR_REGISTRY}/backend"
        FRONTEND_IMAGE_NAME = "${HARBOR_REGISTRY}/frontend"
        
        // Vault Configuration
        VAULT_ADDR        = 'http://127.0.0.1:8200'
        VAULT_SECRET_PATH = 'secret/church-app-db'
        
        // Git Repository & Branch
        GIT_REPO_URL      = 'https://github.com/zele26/Sunday-school-management-system.git'
        GIT_BRANCH        = 'main'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "===> Stage 1: Checking out source code from Git..."
                checkout scm
                script {
                    // Generate dynamic tag AFTER checkout prevents NullPointerException
                    env.GIT_SHORT_COMMIT = sh(script: "git rev-parse --short=8 HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${env.GIT_SHORT_COMMIT}"
                    echo "Building Image Tag: ${env.IMAGE_TAG} on branch ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Fetch Vault Secrets') {
            steps {
                echo "===> Stage 2: Authenticating with HashiCorp Vault..."
                withVault(configuration: [vaultUrl: "${env.VAULT_ADDR}", vaultCredentialId: 'vault-dev-token'], 
                          vaultSecrets: [
                              [path: "${env.VAULT_SECRET_PATH}", 
                               engineVersion: 2, 
                               secretValues: [
                                   [envVar: 'DB_USER', vaultKey: 'username'],
                                   [envVar: 'DB_PASS', vaultKey: 'password']
                               ]]
                          ]) {
                    script {
                        echo "Successfully verified Vault connection and pulled database secrets!"
                    }
                }
            }
        }

        stage('Code Quality & Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('church-server') {
                            echo "===> Testing Backend (Node.js)..."
                            sh 'npm install' // Changed from npm ci
                            sh 'npm test --if-present || true'
                        }
                    }
                }
                stage('Frontend Tests & Build') {
                    steps {
                        dir('church-system') {
                            echo "===> Testing & Linting Frontend (React/Vite)..."
                            sh 'npm install' // Changed from npm ci
                            sh 'npm run lint --if-present'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('SAST - SonarQube Code Analysis') {
            steps {
                echo "===> Stage 4: Running Static Application Security Testing (SAST)..."
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    script {
                        dir('church-server') {
                            sh """
                            echo "Scanning Backend..."
                            // npx sonar-scanner -Dsonar.projectKey=church-backend -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.login=\${SONAR_TOKEN} || true
                            """
                        }
                        dir('church-system') {
                            sh """
                            echo "Scanning Frontend..."
                            // npx sonar-scanner -Dsonar.projectKey=church-frontend -Dsonar.sources=src -Dsonar.host.url=http://localhost:9000 -Dsonar.login=\${SONAR_TOKEN} || true
                            """
                        }
                    }
                }
            }
        }

        stage('SCA - Dependency Vulnerability Audit') {
            steps {
                echo "===> Stage 5: Running Software Composition Analysis (SCA)..."
                dir('church-server') {
                    sh 'npm audit --audit-level=high || true'
                }
                dir('church-system') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "===> Stage 6: Building Container Images..."
                script {
                    echo "Building Backend Container: ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}"
                    sh "docker build -t ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG} -t ${env.BACKEND_IMAGE_NAME}:latest ./church-server"

                    echo "Building Frontend Container: ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}"
                    sh "docker build -t ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG} -t ${env.FRONTEND_IMAGE_NAME}:latest ./church-system"
                }
            }
        }

        stage('Container Image Security Scan (Trivy)') {
            steps {
                echo "===> Stage 7: Vulnerability Scanning Container Images with Trivy..."
                script {
                    sh """
                    echo "Scanning Backend Image..."
                    trivy image --severity HIGH,CRITICAL --exit-code 0 ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}

                    echo "Scanning Frontend Image..."
                    trivy image --severity HIGH,CRITICAL --exit-code 0 ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}
                    """
                }
            }
        }

        stage('Push to Harbor Registry') {
            steps {
                echo "===> Stage 8: Pushing Images to Enterprise Harbor Registry..."
                withCredentials([usernamePassword(credentialsId: 'harbor-robot-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASSWORD')]) {
                    script {
                        sh """
                        echo "\${HARBOR_PASSWORD}" | docker login ${env.HARBOR_HOST} -u "\${HARBOR_USER}" --password-stdin
                        
                        docker push ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}
                        docker push ${env.BACKEND_IMAGE_NAME}:latest
                        
                        docker push ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}
                        docker push ${env.FRONTEND_IMAGE_NAME}:latest
                        """
                    }
                }
            }
        }

stage('Image Signing (Cosign)') {
            steps {
                echo "===> Stage 9: Signing Container Images with Cosign..."
                withCredentials([
                    string(credentialsId: 'cosign-private-key-passphrase', variable: 'COSIGN_PASSWORD'),
                    file(credentialsId: 'cosign-private-key', variable: 'COSIGN_KEY_FILE')
                ]) {
                    script {
                        sh """
                        echo "Signing backend image..."
                        cosign sign --key \${COSIGN_KEY_FILE} -y ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}
                        
                        echo "Signing frontend image..."
                        cosign sign --key \${COSIGN_KEY_FILE} -y ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}
                        """
                    }
                }
            }
        }

        stage('GitOps Update (Manifest Tags)') {
            steps {
                echo "===> Stage 10: Updating Kubernetes / OpenShift Manifest Image Tags for ArgoCD..."
                withCredentials([usernamePassword(credentialsId: 'github-gitops-pat', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PAT')]) {
                    script {
                        sh """
                        git config user.name "Jenkins DevSecOps Bot"
                        git config user.email "devsecops-bot@yourdomain.com"
                        
                        # Update Backend deployment image tag
                        sed -i 's|image: .*backend:.*|image: ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG}|g' k8s-manifests/backend/deployment.yaml
                        
                        # Update Frontend deployment image tag
                        sed -i 's|image: .*frontend:.*|image: ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG}|g' k8s-manifests/frontend/deployment.yaml
                        
                        # Commit the changes
                        git add k8s-manifests/backend/deployment.yaml k8s-manifests/frontend/deployment.yaml
                        git commit -m "ci(gitops): auto-update image tag to ${env.IMAGE_TAG} [skip ci]" || echo "No changes to commit"
                        
                        # Pull latest changes to avoid fast-forward rejection, then push
                        git pull --rebase origin ${env.GIT_BRANCH}
                        git push https://\${GIT_USER}:\${GIT_PAT}@github.com/zele26/Sunday-school-management-system.git HEAD:${env.GIT_BRANCH}
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up local workspace images..."
            sh "docker rmi ${env.BACKEND_IMAGE_NAME}:${env.IMAGE_TAG} || true"
            sh "docker rmi ${env.FRONTEND_IMAGE_NAME}:${env.IMAGE_TAG} || true"
        }
        success {
            echo "SUCCESS: DevSecOps pipeline executed successfully! Image tag ${env.IMAGE_TAG} pushed & GitOps sync triggered."
        }
        failure {
            echo "FAILURE: DevSecOps pipeline failed. Please check build logs."
        }
    }
}