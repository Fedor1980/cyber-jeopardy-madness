package scrolls.consent

import future.keywords.if
import future.keywords.in

# Load the mock consent data
consents := data.consents

# Default deny - consent must be explicitly granted
default allow := false

# Allow if consent_id exists and status is CONSENTED
allow if {
    some consent in consents
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
}

# Deny reasons for debugging
deny_reason["consent_not_found"] if {
    not has_consent_id
}

deny_reason["consent_denied"] if {
    has_consent_id
    not is_consented
}

# Helper rules
has_consent_id if {
    some consent in consents
    consent.consent_id == input.consent_id
}

is_consented if {
    some consent in consents
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
}
