from datetime import datetime, timezone

from flask import Flask, jsonify, render_template, request
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///operations.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


ALLOWED_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
ALLOWED_STATUSES = {"OPEN", "IN_PROGRESS", "RESOLVED"}


class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    property_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(20), nullable=False, default="MEDIUM")
    status = db.Column(db.String(20), nullable=False, default="OPEN")
    description = db.Column(db.Text, nullable=False)
    reported_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "property_name": self.property_name,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "description": self.description,
            "reported_by": self.reported_by,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/issues", methods=["GET"])
def get_issues():
    query = Issue.query

    status = request.args.get("status")
    priority = request.args.get("priority")
    property_name = request.args.get("property_name")
    category = request.args.get("category")
    search = request.args.get("search")

    if status:
        query = query.filter_by(status=status.upper())

    if priority:
        query = query.filter_by(priority=priority.upper())

    if property_name:
        query = query.filter(Issue.property_name.ilike(f"%{property_name}%"))

    if category:
        query = query.filter(Issue.category.ilike(f"%{category}%"))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                Issue.title.ilike(search_term),
                Issue.description.ilike(search_term),
                Issue.property_name.ilike(search_term),
            )
        )

    issues = query.order_by(Issue.created_at.desc()).all()

    return jsonify([issue.to_dict() for issue in issues]), 200


@app.route("/api/issues/<int:issue_id>", methods=["GET"])
def get_issue(issue_id):
    issue = db.session.get(Issue, issue_id)

    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    return jsonify(issue.to_dict()), 200


@app.route("/api/issues", methods=["POST"])
def create_issue():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "A JSON request body is required"}), 400

    required_fields = [
        "title",
        "property_name",
        "category",
        "priority",
        "status",
        "description",
        "reported_by",
    ]

    missing_fields = [
        field for field in required_fields if not str(data.get(field, "")).strip()
    ]

    if missing_fields:
        return jsonify(
            {
                "error": "Missing required fields",
                "fields": missing_fields,
            }
        ), 400

    priority = data["priority"].upper()
    status = data["status"].upper()

    if priority not in ALLOWED_PRIORITIES:
        return jsonify(
            {
                "error": "Invalid priority",
                "allowed_values": sorted(ALLOWED_PRIORITIES),
            }
        ), 400

    if status not in ALLOWED_STATUSES:
        return jsonify(
            {
                "error": "Invalid status",
                "allowed_values": sorted(ALLOWED_STATUSES),
            }
        ), 400

    issue = Issue(
        title=data["title"].strip(),
        property_name=data["property_name"].strip(),
        category=data["category"].strip(),
        priority=priority,
        status=status,
        description=data["description"].strip(),
        reported_by=data["reported_by"].strip(),
    )

    db.session.add(issue)
    db.session.commit()

    return jsonify(issue.to_dict()), 201


@app.route("/api/issues/<int:issue_id>", methods=["PATCH"])
def update_issue(issue_id):
    issue = db.session.get(Issue, issue_id)

    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "A JSON request body is required"}), 400

    editable_fields = {
        "title",
        "property_name",
        "category",
        "priority",
        "status",
        "description",
        "reported_by",
    }

    for field, value in data.items():
        if field not in editable_fields:
            continue

        if value is None or not str(value).strip():
            return jsonify({"error": f"{field} cannot be empty"}), 400

        cleaned_value = str(value).strip()

        if field == "priority":
            cleaned_value = cleaned_value.upper()

            if cleaned_value not in ALLOWED_PRIORITIES:
                return jsonify(
                    {
                        "error": "Invalid priority",
                        "allowed_values": sorted(ALLOWED_PRIORITIES),
                    }
                ), 400

        if field == "status":
            cleaned_value = cleaned_value.upper()

            if cleaned_value not in ALLOWED_STATUSES:
                return jsonify(
                    {
                        "error": "Invalid status",
                        "allowed_values": sorted(ALLOWED_STATUSES),
                    }
                ), 400

        setattr(issue, field, cleaned_value)

    issue.updated_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify(issue.to_dict()), 200


@app.route("/api/issues/<int:issue_id>", methods=["DELETE"])
def delete_issue(issue_id):
    issue = db.session.get(Issue, issue_id)

    if not issue:
        return jsonify({"error": "Issue not found"}), 404

    db.session.delete(issue)
    db.session.commit()

    return "", 204


@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    total_issues = Issue.query.count()
    open_issues = Issue.query.filter_by(status="OPEN").count()
    in_progress_issues = Issue.query.filter_by(status="IN_PROGRESS").count()
    resolved_issues = Issue.query.filter_by(status="RESOLVED").count()
    critical_issues = Issue.query.filter_by(priority="CRITICAL").count()

    return jsonify(
        {
            "total_issues": total_issues,
            "open_issues": open_issues,
            "in_progress_issues": in_progress_issues,
            "resolved_issues": resolved_issues,
            "critical_issues": critical_issues,
        }
    ), 200


def seed_database():
    if Issue.query.count() > 0:
        return

    sample_issues = [
        Issue(
            title="HVAC outage on third floor",
            property_name="North Valley Medical Plaza",
            category="Maintenance",
            priority="CRITICAL",
            status="OPEN",
            description="Multiple tenants reported no cooling in clinical offices.",
            reported_by="Property Operations",
        ),
        Issue(
            title="Elevator inspection follow-up",
            property_name="Lakeside Health Center",
            category="Compliance",
            priority="HIGH",
            status="IN_PROGRESS",
            description="Inspection vendor requested additional documentation.",
            reported_by="Asset Management",
        ),
        Issue(
            title="Tenant access badge request",
            property_name="Westbrook Medical Offices",
            category="Tenant Services",
            priority="MEDIUM",
            status="RESOLVED",
            description="New tenant employees needed building access credentials.",
            reported_by="Tenant Relations",
        ),
    ]

    db.session.add_all(sample_issues)
    db.session.commit()


with app.app_context():
    db.create_all()
    seed_database()


if __name__ == "__main__":
    app.run(debug=True)