# HIPAA PHI (Protected Health Information) Access Control
# Implements HIPAA Privacy Rule requirements for PHI access

package scrolls.consent.hipaa

import future.keywords.if
import future.keywords.in

# Load consent and PHI data
consents := data.consents
phi_records := data.phi_records

# Default deny
default allow := false

# Allow if HIPAA authorization is valid
allow if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
    hipaa_authorization_valid(consent)
    purpose_permitted(consent, input.purpose)
    not authorization_revoked(consent)
}

# Verify HIPAA authorization requirements
hipaa_authorization_valid(consent) if {
    # Must have all required elements per HIPAA
    consent.authorization_type == "HIPAA"
    consent.patient_signature
    consent.authorized_uses
    consent.expiration_date
}

# Check if purpose is within authorized uses
purpose_permitted(consent, purpose) if {
    purpose in consent.authorized_uses
}

purpose_permitted(consent, purpose) if {
    "treatment" in consent.authorized_uses
    purpose == "clinical_care"
}

# Check if authorization has been revoked
authorization_revoked(consent) if {
    consent.revocation_date
    time.parse_rfc3339_ns(consent.revocation_date) < time.now_ns()
}

# Minimum necessary principle
minimum_necessary if {
    # Only access data needed for specified purpose
    input.data_fields
    count(input.data_fields) <= input.max_fields_permitted
}

# Deny reasons
deny_reason["invalid_hipaa_authorization"] if {
    has_consent
    not hipaa_authorization_valid(consents[_])
}

deny_reason["unauthorized_purpose"] if {
    has_consent
    consent := consents[_]
    consent.consent_id == input.consent_id
    not purpose_permitted(consent, input.purpose)
}

deny_reason["authorization_revoked"] if {
    has_consent
    consent := consents[_]
    consent.consent_id == input.consent_id
    authorization_revoked(consent)
}

# Helper rules
has_consent if {
    consents[_].consent_id == input.consent_id
}
