-- Move the founding chapter contact to the ASERS domain.
UPDATE chapters
SET contact_email = 'newjersey@asers.org', updated_at = CURRENT_TIMESTAMP
WHERE slug = 'new-jersey' AND contact_email = 'fairdirector@njsrs.org';
