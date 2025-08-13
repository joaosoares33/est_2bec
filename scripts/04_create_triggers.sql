-- Triggers para auditoria automática

DELIMITER //

-- Trigger atualizado para INSERT com novos campos de usuário
CREATE TRIGGER parking_cards_after_insert
AFTER INSERT ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, new_values, changed_by
    ) VALUES (
        NEW.id, 
        'INSERT', 
        JSON_OBJECT(
            'military_name', NEW.military_name,
            'rank', NEW.rank,
            'war_name', NEW.war_name,
            'vehicle_plate', NEW.vehicle_plate,
            'vehicle_model', NEW.vehicle_model,
            'vehicle_color', NEW.vehicle_color,
            'vehicle_type', NEW.vehicle_type,
            'issue_type', NEW.issue_type,
            'valid_until', NEW.valid_until,
            'status', NEW.status
        ),
        COALESCE(NEW.created_by, 'SYSTEM')
    );
END//

-- Trigger atualizado para UPDATE com novos campos de usuário
CREATE TRIGGER parking_cards_after_update
AFTER UPDATE ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, old_values, new_values, changed_by
    ) VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'military_name', OLD.military_name,
            'rank', OLD.rank,
            'war_name', OLD.war_name,
            'vehicle_plate', OLD.vehicle_plate,
            'vehicle_model', OLD.vehicle_model,
            'vehicle_color', OLD.vehicle_color,
            'vehicle_type', OLD.vehicle_type,
            'issue_type', OLD.issue_type,
            'valid_until', OLD.valid_until,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'military_name', NEW.military_name,
            'rank', NEW.rank,
            'war_name', NEW.war_name,
            'vehicle_plate', NEW.vehicle_plate,
            'vehicle_model', NEW.vehicle_model,
            'vehicle_color', NEW.vehicle_color,
            'vehicle_type', NEW.vehicle_type,
            'issue_type', NEW.issue_type,
            'valid_until', NEW.valid_until,
            'status', NEW.status
        ),
        COALESCE(NEW.updated_by, 'SYSTEM')
    );
END//

-- Trigger atualizado para DELETE com novos campos de usuário
CREATE TRIGGER parking_cards_after_delete
AFTER DELETE ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, old_values, changed_by
    ) VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'military_name', OLD.military_name,
            'rank', OLD.rank,
            'war_name', OLD.war_name,
            'vehicle_plate', OLD.vehicle_plate,
            'vehicle_model', OLD.vehicle_model,
            'vehicle_color', OLD.vehicle_color,
            'vehicle_type', OLD.vehicle_type,
            'issue_type', OLD.issue_type,
            'valid_until', OLD.valid_until,
            'status', OLD.status
        ),
        COALESCE(OLD.updated_by, 'SYSTEM')
    );
END//

-- Novos triggers para auditoria de usuários
CREATE TRIGGER users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, new_values, changed_by
    ) VALUES (
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'username', NEW.username,
            'email', NEW.email,
            'full_name', NEW.full_name,
            'role', NEW.role,
            'status', NEW.status
        ),
        NEW.id
    );
END//

CREATE TRIGGER users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, old_values, new_values, changed_by
    ) VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'username', OLD.username,
            'email', OLD.email,
            'full_name', OLD.full_name,
            'role', OLD.role,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'username', NEW.username,
            'email', NEW.email,
            'full_name', NEW.full_name,
            'role', NEW.role,
            'status', NEW.status
        ),
        NEW.id
    );
END//

CREATE TRIGGER users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, old_values
    ) VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'username', OLD.username,
            'email', OLD.email,
            'full_name', OLD.full_name,
            'role', OLD.role,
            'status', OLD.status
        )
    );
END//

DELIMITER ;
