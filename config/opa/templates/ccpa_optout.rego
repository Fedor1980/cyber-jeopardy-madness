# CCPA (California Consumer Privacy Act) Opt-Out Rights
# Implements CCPA "Do Not Sell" and purpose limitation

package scrolls.consent.ccpa

import future.keywords.if
import future.keywords.in

# Load consent data
consents := data.consents

# Default deny for sale/sharing
default allow_sale := false
default allow := true  # CCPA is opt-out, not opt-in

# Deny if consumer has opted out
allow if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    not opted_out_of_sale(consent)
    not opted_out_of_sharing(consent)
    purpose_compliant(input.purpose)
}

# Check if consumer opted out of sale
opted_out_of_sale(consent) if {
    consent.ccpa_opt_out_sale == true
}

# Check if consumer opted out of sharing
opted_out_of_sharing(consent) if {
    consent.ccpa_opt_out_sharing == true
}

# Verify purpose is not "sale" or "advertising"
purpose_compliant(purpose) if {
    purpose != "sale"
    purpose != "targeted_advertising"
    purpose != "cross_context_behavioral_advertising"
}

# Special handling for sensitive personal information
sensitive_pi_restricted if {
    input.data_category == "sensitive_personal_information"
    consent := consents[_]
    consent.consent_id == input.consent_id
    consent.limit_sensitive_pi_use == true
}

# Deny reasons
deny_reason["opted_out_of_sale"] if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    opted_out_of_sale(consent)
    input.purpose == "sale"
}

deny_reason["opted_out_of_sharing"] if {
    consent := consents[_]
    consent.consent_id == input.consent_id
    opted_out_of_sharing(consent)
    input.purpose in ["sharing", "targeted_advertising"]
}

deny_reason["sensitive_pi_restriction"] if {
    sensitive_pi_restricted
}

# Consumer rights verification
consumer_rights_honored if {
    consent := consents[_]
    consent.consent_id == input.consent_id

    # Right to know
    consent.disclosed_categories
    consent.disclosed_purposes

    # Right to delete (check if deletion requested)
    not consent.deletion_requested
}
