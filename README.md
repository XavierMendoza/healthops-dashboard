# HealthOps Dashboard

A full-stack operations dashboard built with **Flask**, **SQLAlchemy**, **SQLite**, **Docker**, and **JavaScript** to help healthcare property teams track, prioritize, and resolve operational issues.

![Python](https://img.shields.io/badge/Python-3.14-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-black)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red)
![Render](https://img.shields.io/badge/Hosted%20on-Render-purple)

**Live Demo:** [HealthOps Dashboard](https://healthops-dashboard.onrender.com/)

**GitHub Repository:** https://github.com/XavierMendoza/healthops-dashboard

---

# Project Overview

HealthOps is a lightweight operational issue tracking system inspired by real-world healthcare property management workflows.

The application allows teams to:

- Report operational issues
- Track issue status
- Prioritize work
- Search and filter requests
- View dashboard metrics
- Manage operational workflows through a REST API

The goal of the project was to rapidly prototype a business application while learning Flask and demonstrating backend engineering fundamentals.

---

# Business Problem

Healthcare property managers often coordinate maintenance requests, compliance issues, and tenant service requests across multiple buildings.

Without a centralized system, operational requests are frequently managed through emails, spreadsheets, or phone calls, making it difficult to:

- Track work
- Prioritize critical issues
- Monitor progress
- Provide operational visibility

HealthOps provides a simple centralized dashboard for managing these operational requests.

---

# Features

- RESTful Flask API
- CRUD Operations
- Dashboard analytics
- Search functionality
- Filtering by priority
- Filtering by status
- Responsive frontend
- Docker support
- SQLAlchemy ORM
- SQLite database

---

# Tech Stack

### Backend

- Python
- Flask
- SQLAlchemy

### Frontend

- HTML
- CSS
- JavaScript

# Key Skills Demonstrated

- REST API Design
- CRUD Operations
- Object-Oriented Programming
- Database Modeling
- ORM with SQLAlchemy
- Docker Containerization
- Git & GitHub Workflow
- Full-Stack Development
- Rapid Prototyping

### Database

- SQLite

### DevOps

- Docker
- Render

### Tools

- Git
- GitHub
- Postman

---

# Architecture

```
Browser
     │
     ▼
HTML / CSS / JavaScript
     │
HTTP Requests
     │
     ▼
Flask REST API
     │
SQLAlchemy ORM
     │
     ▼
SQLite Database
```

---

# REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/issues | Retrieve all issues |
| GET | /api/dashboard | Retrieve dashboard metrics |
| POST | /api/issues | Create an issue |
| PATCH | /api/issues/{id} | Update issue status |
| DELETE | /api/issues/{id} | Delete an issue |

---

# Docker

The application is fully containerized using Docker.

Build:

```bash
docker build -t healthops-dashboard .
```

Run:

```bash
docker run -p 5000:5000 healthops-dashboard
```

---

# Future Improvements

- PostgreSQL
- User Authentication
- Role-Based Authorization
- Audit Logging
- Email Notifications
- React Frontend
- AWS Deployment

---

# Development Process

This project was intentionally built as a rapid prototype to strengthen practical Flask development skills while simulating a real-world healthcare operations workflow.

AI was used as an engineering partner to accelerate implementation, explore framework-specific concepts, and iterate quickly. Final architectural decisions, debugging, testing, Dockerization, and deployment were performed by the developer.
---

# Engineering Takeaways

While building this project I gained hands-on experience with:

- Flask
- REST API development
- SQLAlchemy
- Docker
- GitHub workflows
- Render deployment
- Full-stack application architecture

---

# Author

**Xavier Mendoza**

Computer Science Student

Backend / Full Stack Software Engineering