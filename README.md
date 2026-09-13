# Tekle Sawiros Sunday School Management & LMS
> **የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት የመረጃና የርቀት ትምህርት ማኔጅመንት ሲስተም**

A complete Sunday School Management System and Distance Learning Platform built for **Mahdere Sibhat Kidist Lideta Lemaryam Debre Medhanit Medhanealem Church — Tekle Sawiros Sunday School** in Addis Ababa, Ethiopia.

👉 **[View Full UI Showcase & Screenshots (SHOWCASE.md)](./SHOWCASE.md)**

---

## 💡 What This System Does

- **Online Admissions:** Digital registration for on-campus and distance students with bank receipt uploads.
- **Distance Education (LMS):** 3-year online course curriculum with study modules and video lessons.
- **QR Certificate Verification:** Public portal to scan and verify authentic graduation certificates.
- **Application Tracking:** Students can check their admission status anytime with their phone number.
- **Staff & Teacher Portals:** Role-based dashboards for managing student rosters, grades, attendance, and admissions.
- **Bilingual Interface:** Full support for both Amharic and English.

---

## 🛠️ Tech Stack & DevSecOps Practices

- **Frontend:** Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express 5, MongoDB / Mongoose, JWT Auth, Cloudinary
- **DevSecOps Pipeline:** Jenkins CI/CD, SonarQube (SAST), `npm audit` (SCA), Trivy container scanning, Harbor private registry, Cosign image signing, HashiCorp Vault secrets, ArgoCD GitOps, Red Hat OpenShift, Docker, Nginx

---

## 🛡️ DevSecOps Highlights
- **Shift-Left Security:** Automated SAST & SCA checks on every pull request.
- **Zero-Trust Secrets:** HashiCorp Vault integration with dynamic secrets (no credentials in Git).
- **Container Vulnerability Gates:** Trivy & Harbor scan-on-push blocking critical CVEs.
- **GitOps Delivery:** ArgoCD automated deployment to OpenShift with drift detection.

👉 **[Read Full DevSecOps Guide & Pipeline Setup (DEVSECOPS.md)](./DEVSECOPS.md)** | **[View UI Showcase (SHOWCASE.md)](./SHOWCASE.md)**

---

## 👨‍💻 Developer

**Zelalem Fiseha Gelaye**  
- LinkedIn: [linkedin.com/in/zelalem-fiseha-7198b3148](https://www.linkedin.com/in/zelalem-fiseha-7198b3148/)  
- GitHub: [@zele26](https://github.com/zele26)  

---

## 📜 License

© 2026 Tekle Sawiros Sunday School. All rights reserved.
