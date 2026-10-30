# Digital Forensics Case Management System

## Project Overview

The **Digital Forensics Case Management System** is a database-driven project designed to help digital forensic investigators organise, manage, track, and review digital evidence during investigations.

Digital forensic investigations involve handling different types of evidence, including computers, mobile devices, storage drives, digital files, and other electronic artifacts. Managing this information manually can lead to missing records, difficulty tracking evidence, and problems maintaining proper documentation.

This project aims to provide a centralised system to manage investigation cases, investigators, devices, evidence records, findings, and chain-of-custody information.

The system uses **MySQL as its primary relational database** and **MongoDB for flexible digital artifact metadata storage**.

## Objectives

- Maintain organised records of digital forensic investigation cases.
- Manage investigators and their case assignments.
- Register and track digital evidence and associated devices.
- Maintain chain-of-custody records for evidence handling.
- Store investigation findings and notes.
- Maintain audit logs for selected database activities.
- Monitor recorded evidence integrity statuses.
- Support flexible metadata storage for different digital artifact types.
- Generate useful reports using SQL queries.

## Technology Stack

| Technology | Purpose |
|---|---|
| MySQL 8.0+ | Primary relational database |
| MongoDB | Flexible artifact metadata storage |
| SQL | Database operations and reporting |
| JavaScript | MongoDB scripts |
| Next.js | Planned frontend and application layer |

## Database Architecture

The project uses a combination of relational and document-based databases.

### 1. MySQL – Relational Database

MySQL stores the structured information and relationships required for managing digital forensic investigations.

The database is named:

`digital_forensics_db`

It consists of the following 11 tables:

| Table | Description |
|---|---|
| users | Stores user account information and roles |
| investigators | Stores investigator details |
| cases | Stores forensic investigation case information |
| case_investigators | Maps investigators to their assigned cases |
| devices | Stores information about digital devices |
| evidence | Stores evidence records and integrity information |
| evidence_devices | Maps evidence records to associated devices |
| findings | Stores investigation findings |
| notes | Stores investigator notes |
| chain_of_custody | Maintains evidence handling and transfer history |
| audit_logs | Records selected database activities |

### 2. MongoDB – NoSQL Database

MongoDB is intended to store flexible metadata associated with digital forensic artifacts.

Different digital artifacts may have different attributes. For example, browser history may contain browser details and visited URLs, whereas a memory dump may contain memory size, operating system information, and extraction details.

MongoDB allows these different metadata structures to be stored as documents without requiring every artifact to follow an identical relational schema.

The planned MongoDB database is:

`digital_forensics_metadata`

The collection is:

`artifact_metadata`

The application layer will associate MongoDB documents with MySQL evidence records using identifiers such as `evidence_code`.

**Note:** MongoDB does not enforce foreign keys to MySQL. Cross-database relationships must be validated by the application.

## Entity Relationship Diagram

The project contains 11 relational tables connected through primary keys and foreign keys.

The ER diagram represents relationships between:

- Users and investigators
- Users and cases
- Cases and investigators
- Cases and evidence
- Evidence and devices
- Cases and findings
- Cases and notes
- Evidence and chain-of-custody records

The `audit_logs` table uses generic table and record references rather than conventional foreign keys to every audited table.

## DBMS Concepts Implemented

The project demonstrates the following database management concepts:

### Relational Database Concepts
- Database creation and management
- Table creation using DDL
- Data insertion and manipulation using DML
- Primary keys and foreign keys
- Unique constraints
- Check constraints and ENUM data types
- One-to-many and many-to-many relationships
- Composite primary keys

### SQL Queries
- SELECT, INSERT, UPDATE, and DELETE
- WHERE and ORDER BY clauses
- INNER JOIN and other relational joins
- Aggregate functions
- GROUP BY and HAVING
- Nested and correlated subqueries
- Full-text searching

### Advanced SQL Concepts
- Views for reusable reports
- Stored procedures for reusable database operations
- Triggers for automatic audit logging
- Indexes for improving query performance
- Transactions for controlled database operations
- Temporary tables for intermediate data processing

### NoSQL Concepts
- MongoDB database and collection creation
- Document insertion and retrieval
- Flexible document structures
- Index creation
- Filtering and aggregation pipelines

## Novelty and Innovation

### Evidence Integrity and Chain-of-Custody Risk Monitor

The proposed novelty of the project is an **Evidence Integrity and Chain-of-Custody Risk Monitor**.

Traditional case management systems primarily focus on storing investigation details and evidence records. This project proposes an additional monitoring feature that identifies evidence records that may require further review.

The proposed feature combines:

1. **Evidence Integrity Monitoring:** Examines recorded SHA-256 hashes and integrity statuses to identify records marked as unverified or mismatched.

2. **Chain-of-Custody Review:** Examines evidence handling records to identify incomplete handovers or missing custody information.

3. **Flexible Artifact Metadata:** Uses MongoDB to store additional metadata associated with different digital artifact types.

4. **Risk Identification:** Combines the available information to flag records that require investigator attention.

The purpose is to improve evidence traceability and help investigators identify potential inconsistencies more efficiently.

A risk flag does not automatically prove evidence tampering. Actual file-hash verification requires calculating a hash from the evidence file and comparing it with a trusted previously recorded hash.

## Project Setup

### Prerequisites

Install the following:

- MySQL Server 8.0 or later
- MySQL Command Line Client
- MongoDB Community Server or MongoDB Atlas
- MongoDB Shell (`mongosh`)
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd Digital-Forensics-Case-Management-System
```

### 2. Set Up the MySQL Database

Open MySQL Command Line Client and log in:

```bash
mysql -u root -p
```

Run the SQL file:

```sql
SOURCE C:/path/to/digital_forensics_db.sql;
```

Alternatively, execute the SQL file directly from the terminal:

```bash
mysql -u root -p < digital_forensics_db.sql
```

Select the database:

```sql
USE digital_forensics_db;
```

Verify the tables:

```sql
SHOW TABLES;
```

Verify the sample records:

```sql
SELECT * FROM cases;
SELECT * FROM evidence;
SELECT * FROM investigators;
```

### 3. Set Up MongoDB

Open MongoDB Shell:

```bash
mongosh
```

Run the MongoDB script:

```javascript
load("mongo_artifact_metadata.js")
```

Verify the database:

```javascript
use digital_forensics_metadata

show collections

db.artifact_metadata.find().pretty()
```

### 4. Verify the Database

Check the number of cases:

```sql
SELECT COUNT(*) AS total_cases
FROM cases;
```

Check the number of evidence records:

```sql
SELECT COUNT(*) AS total_evidence
FROM evidence;
```

View the case evidence summary:

```sql
SELECT * FROM v_case_evidence_summary;
```

## Sample SQL Queries

### 1. Display Cases and Evidence

```sql
SELECT
    c.case_number,
    c.title,
    e.evidence_code,
    e.integrity_status
FROM cases c
JOIN evidence e
ON c.case_id = e.case_id;
```

### 2. Count Cases by Status

```sql
SELECT
    status,
    COUNT(*) AS case_count
FROM cases
GROUP BY status;
```

### 3. Find Cases Containing at Least Two Evidence Records

```sql
SELECT
    c.case_number,
    c.title,
    COUNT(e.evidence_id) AS evidence_count
FROM cases c
JOIN evidence e
ON c.case_id = e.case_id
GROUP BY c.case_id, c.case_number, c.title
HAVING COUNT(e.evidence_id) >= 2;
```

### 4. Identify Evidence Requiring Integrity Review

```sql
SELECT
    evidence_code,
    case_id,
    integrity_status
FROM evidence
WHERE integrity_status IN ('UNVERIFIED', 'MISMATCH');
```

### 5. View Audit Logs

```sql
SELECT * FROM audit_logs;
```

## Project Structure

```text
Digital-Forensics-Case-Management-System/
│
├── README.md
│
├── database/
│   ├── digital_forensics_db.sql
│   └── mongo_artifact_metadata.js
│
├── diagrams/
│   ├── ER_Diagram.pdf
│   ├── ER_Diagram.png
│   └── ER_Diagram.puml
│
├── reports/
│   └── Project_Report.pdf
│
└── documentation/
    ├── DEMO_SCRIPT.md
    └── VIVA_QUICK_PREP.md
```

## Testing and Verification

The following areas should be verified during project testing:

- Successful creation of the MySQL database and all 11 tables.
- Successful insertion and retrieval of sample records.
- Correct functioning of primary key and foreign key relationships.
- Correct execution of JOIN, GROUP BY, HAVING, and aggregate queries.
- Successful creation and retrieval of views.
- Correct functioning of stored procedures and triggers.
- Creation and verification of indexes.
- Successful insertion and retrieval of MongoDB artifact metadata.
- Correct execution of MongoDB filtering and aggregation queries.
- Correct identification of evidence records requiring review.

## Limitations

- The current database implementation focuses primarily on database operations.
- The Next.js application interface is part of the planned application layer.
- MongoDB integration requires application-level validation of relationships with MySQL.
- Sample evidence hashes are demonstration values and must not be treated as verified hashes of actual files.
- Risk flags indicate records requiring review and do not independently establish evidence tampering.
- Automated custody anomaly detection and actual file-hash verification require additional implementation and testing.

## Future Enhancements

- Develop a complete Next.js web interface.
- Implement role-based authentication for administrators and investigators.
- Integrate MySQL and MongoDB through the application backend.
- Implement actual SHA-256 file hashing and integrity verification.
- Develop automated chain-of-custody review rules.
- Add a dashboard for evidence status and investigation summaries.
- Generate downloadable investigation reports.
- Implement notifications for evidence records requiring attention.

## Conclusion

The Digital Forensics Case Management System provides a structured approach to managing digital forensic investigations and evidence records.

By combining MySQL relational database management with MongoDB document-based metadata storage, the project aims to support organised case management, evidence traceability, and flexible digital artifact storage.

The project demonstrates important DBMS concepts while proposing an Evidence Integrity and Chain-of-Custody Risk Monitor to help investigators identify records that require further review.

---

**Project:** Digital Forensics Case Management System  
**Database:** MySQL and MongoDB  
**Primary Focus:** Case Management, Digital Evidence Tracking, and Chain of Custody
