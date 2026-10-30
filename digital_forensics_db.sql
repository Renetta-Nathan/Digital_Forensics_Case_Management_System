-- Digital Forensics Case Management System
-- DBMS Level 3 | MySQL 8.0+
-- Demo data is fictional. Run this script in MySQL Workbench.
CREATE DATABASE IF NOT EXISTS digital_forensics_db;
USE digital_forensics_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_case_evidence_summary;
DROP VIEW IF EXISTS v_active_cases;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS chain_of_custody;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS findings;
DROP TABLE IF EXISTS evidence_devices;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS case_investigators;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS investigators;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','INVESTIGATOR','AUDITOR') NOT NULL DEFAULT 'INVESTIGATOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investigators (
  investigator_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  badge_number VARCHAR(30) NOT NULL UNIQUE,
  specialization VARCHAR(100),
  phone VARCHAR(30),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE cases (
  case_id INT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_PROGRESS','ON_HOLD','CLOSED') NOT NULL DEFAULT 'OPEN',
  opened_date DATE NOT NULL,
  closed_date DATE NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (closed_date IS NULL OR closed_date >= opened_date),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE case_investigators (
  case_id INT NOT NULL,
  investigator_id INT NOT NULL,
  assignment_role VARCHAR(60) NOT NULL DEFAULT 'Investigator',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id, investigator_id),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (investigator_id) REFERENCES investigators(investigator_id) ON DELETE CASCADE
);

CREATE TABLE devices (
  device_id INT AUTO_INCREMENT PRIMARY KEY,
  device_tag VARCHAR(40) NOT NULL UNIQUE,
  device_type ENUM('LAPTOP','MOBILE','USB','SERVER','OTHER') NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(120),
  collected_at DATETIME,
  notes VARCHAR(500)
);

CREATE TABLE evidence (
  evidence_id INT AUTO_INCREMENT PRIMARY KEY,
  evidence_code VARCHAR(40) NOT NULL UNIQUE,
  case_id INT NOT NULL,
  evidence_type ENUM('DISK_IMAGE','MOBILE_EXTRACTION','LOG_FILE','BROWSER_DATA','MEMORY_DUMP','DOCUMENT','OTHER') NOT NULL,
  description TEXT,
  sha256 CHAR(64) NOT NULL,
  acquisition_method VARCHAR(120),
  storage_uri VARCHAR(500),
  collected_at DATETIME NOT NULL,
  collected_by INT NOT NULL,
  integrity_status ENUM('UNVERIFIED','VERIFIED','MISMATCH') NOT NULL DEFAULT 'UNVERIFIED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (CHAR_LENGTH(sha256) = 64),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (collected_by) REFERENCES investigators(investigator_id)
);

CREATE TABLE evidence_devices (
  evidence_id INT NOT NULL,
  device_id INT NOT NULL,
  association_note VARCHAR(250),
  PRIMARY KEY (evidence_id, device_id),
  FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE findings (
  finding_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  evidence_id INT NULL,
  investigator_id INT NOT NULL,
  finding_title VARCHAR(180) NOT NULL,
  finding_text TEXT NOT NULL,
  confidence ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  found_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE SET NULL,
  FOREIGN KEY (investigator_id) REFERENCES investigators(investigator_id)
);

CREATE TABLE notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  investigator_id INT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (investigator_id) REFERENCES investigators(investigator_id)
);

CREATE TABLE chain_of_custody (
  custody_id INT AUTO_INCREMENT PRIMARY KEY,
  evidence_id INT NOT NULL,
  from_handler VARCHAR(120),
  to_handler VARCHAR(120) NOT NULL,
  action ENUM('COLLECTED','TRANSFERRED','ACCESSED','SEALED','UNSEALED','RETURNED','DISPOSED') NOT NULL,
  event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seal_number VARCHAR(60),
  remarks VARCHAR(500),
  recorded_by INT NOT NULL,
  FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES investigators(investigator_id)
);

CREATE TABLE audit_logs (
  audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(64) NOT NULL,
  record_id BIGINT,
  action_type VARCHAR(20) NOT NULL,
  action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  details VARCHAR(1000)
);

CREATE INDEX idx_cases_status_priority ON cases(status, priority);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_evidence_hash ON evidence(sha256);
CREATE INDEX idx_custody_evidence_time ON chain_of_custody(evidence_id, event_time);
CREATE FULLTEXT INDEX ft_findings_text ON findings(finding_title, finding_text);

DELIMITER //
CREATE TRIGGER trg_evidence_after_insert
AFTER INSERT ON evidence
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs(table_name, record_id, action_type, details)
  VALUES ('evidence', NEW.evidence_id, 'INSERT',
          CONCAT('Evidence registered: ', NEW.evidence_code, '; SHA256=', NEW.sha256));
END//

CREATE TRIGGER trg_custody_after_insert
AFTER INSERT ON chain_of_custody
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs(table_name, record_id, action_type, details)
  VALUES ('chain_of_custody', NEW.custody_id, 'INSERT',
          CONCAT('Evidence ', NEW.evidence_id, ' action ', NEW.action, ' to ', NEW.to_handler));
END//

CREATE PROCEDURE sp_assign_investigator(IN p_case_id INT, IN p_investigator_id INT, IN p_role VARCHAR(60))
BEGIN
  INSERT INTO case_investigators(case_id, investigator_id, assignment_role)
  VALUES (p_case_id, p_investigator_id, p_role)
  ON DUPLICATE KEY UPDATE assignment_role = VALUES(assignment_role);
END//

CREATE PROCEDURE sp_update_integrity(IN p_evidence_id INT, IN p_status VARCHAR(20))
BEGIN
  IF p_status NOT IN ('UNVERIFIED','VERIFIED','MISMATCH') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid integrity status';
  END IF;
  UPDATE evidence SET integrity_status = p_status WHERE evidence_id = p_evidence_id;
END//
DELIMITER ;

CREATE VIEW v_active_cases AS
SELECT c.case_id, c.case_number, c.title, c.priority, c.status, c.opened_date,
       u.full_name AS created_by_name
FROM cases c JOIN users u ON u.user_id = c.created_by
WHERE c.status IN ('OPEN','IN_PROGRESS','ON_HOLD');

CREATE VIEW v_case_evidence_summary AS
SELECT c.case_id, c.case_number, c.title, c.status,
       COUNT(e.evidence_id) AS evidence_count,
       SUM(CASE WHEN e.integrity_status = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatched_items
FROM cases c LEFT JOIN evidence e ON e.case_id = c.case_id
GROUP BY c.case_id, c.case_number, c.title, c.status;

-- Fictional sample data; password_hash values are placeholders for demo only.
INSERT INTO users(full_name,email,password_hash,role) VALUES
('Asha Rao','asha.rao@example.test','DEMO_HASH_REPLACE_WITH_BCRYPT','ADMIN'),
('Kabir Shah','kabir.shah@example.test','DEMO_HASH_REPLACE_WITH_BCRYPT','INVESTIGATOR'),
('Meera Iyer','meera.iyer@example.test','DEMO_HASH_REPLACE_WITH_BCRYPT','INVESTIGATOR'),
('Dev Menon','dev.menon@example.test','DEMO_HASH_REPLACE_WITH_BCRYPT','AUDITOR');

INSERT INTO investigators(user_id,badge_number,specialization,phone) VALUES
(2,'INV-104','Mobile Forensics','9000000104'),
(3,'INV-105','Disk and File-System Forensics','9000000105');

INSERT INTO cases(case_number,title,description,priority,status,opened_date,created_by) VALUES
('DF-2026-001','Suspicious Data Exfiltration','Review of possible unauthorized transfer of company files.','CRITICAL','IN_PROGRESS','2026-10-01',1),
('DF-2026-002','Account Compromise Review','Investigation of suspicious sign-in and account activity.','HIGH','OPEN','2026-10-05',1),
('DF-2026-003','Lost Device Investigation','Examine recovered laptop and removable storage.','MEDIUM','CLOSED','2026-09-12',1),
('DF-2026-004','Browser Artifact Review','Review browser artifacts related to a reported incident.','LOW','ON_HOLD','2026-10-12',1);

INSERT INTO case_investigators(case_id,investigator_id,assignment_role) VALUES
(1,1,'Lead Investigator'),(1,2,'Supporting Investigator'),
(2,1,'Lead Investigator'),(3,2,'Lead Investigator'),(4,1,'Lead Investigator');

INSERT INTO devices(device_tag,device_type,manufacturer,model,serial_number,collected_at,notes) VALUES
('DEV-LAP-001','LAPTOP','Lenovo','ThinkPad','SN-DEMO-001','2026-10-01 10:30:00','Fictional seized laptop'),
('DEV-MOB-002','MOBILE','Samsung','Galaxy','SN-DEMO-002','2026-10-05 14:15:00','Fictional mobile device'),
('DEV-USB-003','USB','SanDisk','Ultra','SN-DEMO-003','2026-09-12 09:00:00','Fictional USB device'),
('DEV-SRV-004','SERVER','Generic','Virtual Server','SN-DEMO-004','2026-10-12 12:00:00','Fictional server log source');

INSERT INTO evidence(evidence_code,case_id,evidence_type,description,sha256,acquisition_method,storage_uri,collected_at,collected_by,integrity_status) VALUES
('EV-001',1,'DISK_IMAGE','Forensic image of laptop drive',REPEAT('a',64),'Write-blocked forensic imaging','vault://case1/EV-001','2026-10-01 11:00:00',1,'VERIFIED'),
('EV-002',1,'LOG_FILE','Proxy logs for relevant period',REPEAT('b',64),'Secure log export','vault://case1/EV-002','2026-10-01 11:30:00',2,'VERIFIED'),
('EV-003',2,'MOBILE_EXTRACTION','Logical mobile extraction',REPEAT('c',64),'Forensic extraction tool','vault://case2/EV-003','2026-10-05 15:00:00',1,'UNVERIFIED'),
('EV-004',3,'DOCUMENT','Recovered document set',REPEAT('d',64),'Read-only collection','vault://case3/EV-004','2026-09-12 09:30:00',2,'MISMATCH'),
('EV-005',4,'BROWSER_DATA','Browser history artifact package',REPEAT('e',64),'Forensic collection','vault://case4/EV-005','2026-10-12 12:30:00',1,'VERIFIED');

INSERT INTO evidence_devices(evidence_id,device_id,association_note) VALUES
(1,1,'Disk image acquired from laptop'),(2,4,'Logs exported from server'),
(3,2,'Extraction from mobile device'),(4,3,'Documents found on removable media');

INSERT INTO findings(case_id,evidence_id,investigator_id,finding_title,finding_text,confidence) VALUES
(1,1,1,'Unusual archive creation','A large archive was created shortly before the reported transfer window.','HIGH'),
(1,2,2,'Outbound transfer spike','Proxy logs show an unusual outbound transfer volume in the review window.','MEDIUM'),
(2,3,1,'Unknown session token','Artifact review identified a session token requiring further validation.','MEDIUM'),
(3,4,2,'Hash verification mismatch','Recomputed digest differs from the originally recorded digest; preserve and escalate.','HIGH'),
(4,5,1,'Relevant browsing timeline','Browser timestamps may correlate with the reported incident timeline.','LOW');

INSERT INTO notes(case_id,investigator_id,note_text) VALUES
(1,1,'Preserve original media and work only from verified forensic copies.'),
(1,2,'Correlate proxy timestamps with archive creation time.'),
(2,1,'Request authorization before additional device acquisition.'),
(3,2,'Do not rely on the mismatched item until integrity review is complete.');

INSERT INTO chain_of_custody(evidence_id,from_handler,to_handler,action,event_time,seal_number,remarks,recorded_by) VALUES
(1,NULL,'Kabir Shah','COLLECTED','2026-10-01 11:00:00','SEAL-001','Initial collection',1),
(1,'Kabir Shah','Evidence Locker A','SEALED','2026-10-01 11:15:00','SEAL-001','Placed in secure storage',1),
(1,'Evidence Locker A','Meera Iyer','TRANSFERRED','2026-10-02 09:00:00','SEAL-001','Authorized analysis transfer',2),
(2,NULL,'Meera Iyer','COLLECTED','2026-10-01 11:30:00','SEAL-002','Log export registered',2),
(4,NULL,'Kabir Shah','COLLECTED','2026-09-12 09:30:00','SEAL-004','Recovered document set',2);

-- ALTER example required for DDL demonstration (safe idempotency not guaranteed).
-- Run once if asked to demonstrate ALTER:
-- ALTER TABLE cases ADD COLUMN internal_reference VARCHAR(50) NULL;
-- DROP example: use a temporary table rather than dropping project data:
CREATE TEMPORARY TABLE ddl_demo (id INT PRIMARY KEY);
ALTER TABLE ddl_demo ADD COLUMN label VARCHAR(30);
DROP TEMPORARY TABLE ddl_demo;

-- REPORT 1: Evidence count and integrity status per case
SELECT * FROM v_case_evidence_summary ORDER BY evidence_count DESC;

-- REPORT 2: Number of cases by status
SELECT status, COUNT(*) AS case_count
FROM cases GROUP BY status ORDER BY case_count DESC;

-- REPORT 3: Cases containing at least two evidence items
SELECT c.case_number, c.title, COUNT(e.evidence_id) AS evidence_count
FROM cases c JOIN evidence e ON e.case_id = c.case_id
GROUP BY c.case_id, c.case_number, c.title
HAVING COUNT(e.evidence_id) >= 2;

-- REPORT 4: Investigator workload
SELECT i.investigator_id, u.full_name,
       COUNT(DISTINCT ci.case_id) AS assigned_cases,
       COUNT(DISTINCT e.evidence_id) AS collected_evidence
FROM investigators i
JOIN users u ON u.user_id = i.user_id
LEFT JOIN case_investigators ci ON ci.investigator_id = i.investigator_id
LEFT JOIN evidence e ON e.collected_by = i.investigator_id
GROUP BY i.investigator_id, u.full_name
ORDER BY assigned_cases DESC;

-- REPORT 5: Evidence items needing integrity attention
SELECT e.evidence_code, c.case_number, e.integrity_status, e.sha256
FROM evidence e JOIN cases c ON c.case_id = e.case_id
WHERE e.integrity_status IN ('UNVERIFIED','MISMATCH')
ORDER BY CASE e.integrity_status WHEN 'MISMATCH' THEN 1 ELSE 2 END;

-- REPORT 6: Cases with no assigned investigators (subquery)
SELECT c.case_number, c.title
FROM cases c
WHERE NOT EXISTS (
  SELECT 1 FROM case_investigators ci WHERE ci.case_id = c.case_id
);

-- REPORT 7: Full-text search (example term)
SELECT finding_id, finding_title,
       MATCH(finding_title, finding_text) AGAINST ('transfer' IN NATURAL LANGUAGE MODE) AS relevance
FROM findings
WHERE MATCH(finding_title, finding_text) AGAINST ('transfer' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC;

-- PROCEDURE DEMO:
-- CALL sp_assign_investigator(2, 2, 'Technical Reviewer');
-- CALL sp_update_integrity(3, 'VERIFIED');

-- TRANSACTION DEMO: perform related writes atomically.
-- START TRANSACTION;
-- INSERT INTO chain_of_custody(evidence_id,from_handler,to_handler,action,remarks,recorded_by)
-- VALUES (1,'Meera Iyer','Auditor Dev','TRANSFERRED','Demo transfer; use only in test run',1);
-- COMMIT;
-- If validation fails, use ROLLBACK instead of COMMIT.

-- AUDIT LOG REPORT
SELECT audit_id, table_name, record_id, action_type, action_time, details
FROM audit_logs ORDER BY action_time DESC;
