# Tekle Sawiros Sunday School Management & Distance LMS
### A Full-Stack Platform for Church Education & Administration

**Developer:** Zelalem Fiseha Gelaye ([GitHub](https://github.com/zele26) • [LinkedIn](https://www.linkedin.com/in/zelalem-fiseha-7198b3148/))  
**Organization:** Mahdere Sibhat Kidist Lideta Lemaryam Debre Medhanit Medhanealem Church — Tekle Sawiros Sunday School (Addis Ababa, Ethiopia)  
**Tech Stack:** Next.js 16, React 19, Node.js, Express, MongoDB, Tailwind CSS, Cloudinary, Docker, Jenkins

---

## 📌 Project Background & Motivation

For years, our Sunday school operated entirely on paper. Every registration season meant long lines, misplaced paper forms, manual bank receipt verification, and difficulty tracking student attendance and grades. On top of that, church members living abroad or outside the city had no way to participate in our courses.

I built this project to solve these practical problems and give our church community a reliable, modern, and easy-to-use digital system.

---

## 🎯 What Problems This Solves

1. **Eliminating Paper Registration & Queues**  
   Students can now register online for regular or distance learning, choose their class, and upload their bank transfer receipts directly.

2. **Distance Learning for Diaspora & Remote Students**  
   A structured multi-year curriculum (Theology, Church History, Sacraments, Biblical Studies) with online lessons, study materials, and assessments.

3. **Verifiable Certificates (Preventing Credential Forgery)**  
   Graduation certificates come with unique QR codes. Anyone can scan the code to instantly verify student details and completion on our public portal.

4. **Self-Service Status Tracking**  
   Applicants can check if their admission or payment slip has been approved simply by entering their phone number or registration code.

5. **A Central Dashboard for Staff and Teachers**  
   Admins can open or close registration periods, approve applicants, manage courses, and assign teachers, while teachers can record grades and attendance.

---

## 🖼️ System Walkthrough & Screenshots

### 1. Public Portal & Community

#### Home Page
The main landing page with current announcements, registration status, vision/mission, and direct links to all public services.

![Home Page](./docs/screenshots/screenshot_01_home.png)

---

#### About & Founder Tribute
A dedicated history section honoring the church builder and founder who established the church and Sunday school, along with our core educational goals.

![About & Founder Page](./docs/screenshots/screenshot_02_about_founder.png)

---

#### Classes & Curriculum Catalog
Overview of all grade levels, syllabus topics, and classroom schedules.

![Classes & Curriculum](./docs/screenshots/screenshot_04_classes.png)

---

#### Announcements & Church Events
Real-time notices, upcoming feast days, and spiritual event updates.

![Announcements](./docs/screenshots/screenshot_05_announcements.png)

---

#### Photo Gallery & History
Organized photo archives with category filtering and full-screen view.

![Photo Gallery](./docs/screenshots/screenshot_06_gallery.png)

---

#### Contact & Location
Contact information with direct phone dialing, Google Map location, and a message form.

![Contact Us](./docs/screenshots/screenshot_07_contact.png)

---

### 2. Distance Learning (LMS)

#### Distance Education Hub
Displays the 3-year curriculum (Batch 1: Foundations & Old Testament, Batch 2: New Testament & Liturgy, Batch 3: Patristics & Advanced Studies) with course descriptions and FAQ.

![Distance Education Hub](./docs/screenshots/screenshot_03_distance_lms.png)

---

#### Student Digital Classroom
Where distance students access their lessons, download reference books, and track course completion.

![Student Classroom](./docs/screenshots/screenshot_16_student_portal.png)

---

### 3. Admissions & Student Registration

#### Regular Student Registration
Step-by-step registration for on-campus classes with personal info, baptism details, and payment slip upload.

![Regular Registration](./docs/screenshots/screenshot_08_register_regular.png)

---

#### Distance Student Registration
Online intake for remote and diaspora learners to enroll in distance course batches.

![Distance Registration](./docs/screenshots/screenshot_09_register_distance.png)

---

#### Application Status Tracker
A simple lookup tool for students to check if their application has been reviewed and approved.

![Status Tracker](./docs/screenshots/screenshot_10_check_status.png)

---

### 4. Certificate Verification & Security

#### QR Certificate Verification
Public verification page that confirms the authenticity of Sunday school diplomas by scanning or entering certificate IDs.

![Certificate Verification](./docs/screenshots/screenshot_11_verify_certificate.png)

---

### 5. Portals & Administration

#### Login Gateway
Role-based login for students, teachers, and administrators.

![Login Page](./docs/screenshots/screenshot_12_login.png)

---

#### Password Recovery
Self-service password reset flow for users.

![Password Reset](./docs/screenshots/screenshot_13_forgot_password.png)

---

#### Admin Dashboard
Central control panel to toggle registration on/off, review student applications, approve receipts, and manage users.

![Admin Portal](./docs/screenshots/screenshot_14_admin_portal.png)

---

#### Teacher Workspace
Where teachers manage class rosters, enter student grades, and share lesson resources.

![Teacher Portal](./docs/screenshots/screenshot_15_teacher_portal.png)

---

## 🛠️ Tech Stack & Key Technical Decisions

- **Frontend:** Next.js 16 (Turbopack) with React 19 for fast server-side rendering and responsive client navigation.
- **Styling & UI:** Tailwind CSS v4 and Framer Motion for clean animations, full dark/light theme support, and responsive layouts.
- **Backend:** Node.js with Express 5 REST API handling business logic, authentication, and file processing.
- **Database:** MongoDB with Mongoose schemas for student records, courses, attendance, and grades.
- **File & Media Storage:** Cloudinary integration for secure payment receipt and document uploads.
- **Bilingual Engine:** Complete Amharic and English translation support built into the frontend.
- **DevSecOps:** Docker containerization, Nginx reverse proxy, and a Jenkins CI/CD pipeline for automated testing and deployment.

---

## 📬 Contact & Links

Built by **Zelalem Fiseha Gelaye**  
- **GitHub:** [github.com/zele26](https://github.com/zele26)  
- **LinkedIn:** [linkedin.com/in/zelalem-fiseha-7198b3148](https://www.linkedin.com/in/zelalem-fiseha-7198b3148/)
