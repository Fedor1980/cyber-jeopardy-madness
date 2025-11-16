# GDPR Article 6 - Lawful Basis for Processing
# Implements GDPR Article 6(1) consent verification

package scrolls.consent.gdpr

import future.keywords.if
import future.keywords.in

# Load consent data
consents := data.consents

# Default deny
default allow := false

# Allow if valid GDPR consent exists
allow if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
    gdpr_lawful_basis_valid(consent)
    not consent_expired(consent)
}

# Verify lawful basis under GDPR Article 6(1)
gdpr_lawful_basis_valid(consent) if {
    consent.lawful_basis in ["consent", "contract", "legal_obligation", "vital_interests", "public_task", "legitimate_interests"]
}

# Check if consent has expired
consent_expired(consent) if {
    consent.expiration_date
    time.parse_rfc3339_ns(consent.expiration_date) < time.now_ns()
}

# Deny reasons for audit trail
deny_reason["no_consent_record"] if {
    not has_consent_record
}

deny_reason["consent_not_granted"] if {
    has_consent_record
    not is_consented
}

deny_reason["invalid_lawful_basis"] if {
    has_consent_record
    is_consented
    consent := consents[_]
    consent.consent_id == input.consent_id
    not gdpr_lawful_basis_valid(consent)
}

deny_reason["consent_expired"] if {
    has_consent_record
    is_consented
    consent := consents[_]
    consent.consent_id == input.consent_id
    consent_expired(consent)
}

# Helper rules
has_consent_record if {
    consents[_].consent_id == input.consent_id
}

is_consented if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
}
