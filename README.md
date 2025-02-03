# 📖 Liberty Framework  
### A Scalable and Extensible FastAPI and React Framework for Business Applications  

🚀 **Liberty Framework** is a powerful, modular, and extensible **FastAPI-based and React-based framework** designed to streamline backend development for business applications. It provides **database management, authentication, real-time socket communication, and more**, making it easy to deploy and scale enterprise solutions.  

- Online demo is available at [https://liberty.nomana-it.fr](https://liberty.nomana-it.fr)
- Web page at: [https://nomana-it.fr](https://nomana-it.fr)

---

## ✨ Features  
✅ **FastAPI-based** – High-performance backend with asynchronous capabilities.  
✅ **React-based** – Beautiful and responsive frontend without any dependencies to components.  
✅ **Database Management** – SQLAlchemy, Alembic for migrations, and PostgreSQL support.  
✅ **Real-Time Communication** – Integrated WebSocket (Socket.IO) for live updates.  
✅ **Authentication & Security** – JWT authentication, encryption, and role-based access.  
✅ **Automated Database Migrations** – Alembic versioning for multiple databases.  
✅ **Easy Installation & Deployment** – Available as a **Python package** and **Docker image**.  
✅ **Extensible** – Plugin-based architecture to support future enhancements.  

## ✨ Additional features in the enteprise versions 
  - 🌐 **Traefik**: A powerful reverse proxy for routing and load balancing.
  - ⚙️ **AirFlow**: Automate and manage workflows effortlessly.
  - 🐘 **pgAdmin**: Manage your PostgreSQL database visually with ease.
  - 🔐 **KeyCloak**: OIDC Service for authentication
  - 📂 **Gitea**: Git Repository to manage dags, plugins, backup

---

## 📦 Installation  

### Requirements
A postgres database is needed. you can install your own or use the docker image we provide

### **Option 1: Install via `pip`**
```bash
git clone https://github.com/fblettner/liberty-framework.git
go to backend directory and submit build.sh
pip install liberty-framework
```

### **Option 2: Run with Docker**
```bash
docker pull ghcr.io/fblettner/liberty-framework:latest
docker run -p 8000:8000 ghcr.io/fblettner/liberty-framework
```

---

## 🚀 Quick Start  
After installation, you can **start the framework** with:  
```bash
liberty-start
```
or manually:  
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚙️ URL

- Setup: `http://<your_host>:<your_port>/setup`
- Application: `http://<your_host>:<your_port>`
- API Documentation: `http://<your_host>:<your_port>/api`
- Swagger: `http://<your_host>:<your_port>/test`

---

## 📖 Documentation  
- **Reference**: [https://docs.nomana-it.fr/liberty](https://docs.nomana-it.fr/liberty)

---

## 🤝 Contributing  
We welcome contributions! Here’s how you can help:  
1. **Fork** this repository.  
2. **Clone** your fork:  
   ```bash
   git clone https://github.com/fblettner/liberty-framework.git
   ```
3. **Create a new branch** for your feature:  
   ```bash
   git checkout -b feature-name
   ```
4. **Commit your changes**:  
   ```bash
   git commit -m "Add new feature"
   ```
5. **Push to your fork** and **submit a Pull Request**:  
   ```bash
   git push origin feature-name
   ```
6. **Join discussions** and help improve the framework!  

---

## 💖 Sponsorship  
If you find **Liberty Framework** useful and would like to support its development, consider sponsoring us. Your contributions help maintain the project, add new features, and improve the documentation. Every contribution, big or small, is greatly appreciated!  

To sponsor, visit: **[GitHub Sponsors](https://github.com/sponsors/fblettner)** or reach out to us directly.  

---

## 📜 License  
Liberty Framework is **open-source software** licensed under the **AGPL License**.  
Enterprise features require a license:
  - **NOMASX-1**: Security management, Segregation of duties and licenses compliancy
  - **NOMAJDE** JD-Edwards integration
  - **Airflow Plugins**: Automatic database backup, database synchronisation...
  - **Liberty AI**: Currently, OpenAI is set into the configuration, you have to use your own account without enterprise features license

---

## 📧 Contact & Support  
If you have questions or need support:  
- **Email**: [franck.blettner@nomana-it.fr](mailto:franck.blettner@nomana-it.fr)  
- **GitHub Issues**: [Report an issue](https://github.com/fblettner/liberty-framework/issues)  
- **Discussions**: Join the conversation in the **GitHub Discussions** section.  

---

### ⭐ If you find Liberty Framework useful, consider giving it a star on GitHub!  
```bash
git clone https://github.com/fblettner/liberty-framework.git
cd liberty-framework
```

🚀 **Let's build the future of business applications together!** 🚀  