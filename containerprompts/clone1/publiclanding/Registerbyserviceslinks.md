# Service Registration Links

This file maps each tax service to its corresponding registration entry point.

---

## Service Links

Simple W-2 Tax Filing  
👉 Start W-2 Filing: https://tax.eduardoservices4u.com/signup/?roleId=69aeda2f3676fb0108b7ea81

Family Tax Filing  
👉 Start Family Tax Filing: https://tax.eduardoservices4u.com/signup/?roleId=69aedf223676fb0108b7eaa5

Business Filing (1099 / Self-Employed)  
👉 Start Business Filing: https://tax.eduardoservices4u.com/signup/?roleId=69ae0fee3676fb0108b7e241

Company Taxes (LLC / Corporation)  
👉 Start Company Filing: https://tax.eduardoservices4u.com/signup/?roleId=69aedff93676fb0108b7ead6

Non-Resident Tax Filing  
👉 Start Non-Resident Filing: https://tax.eduardoservices4u.com/signup/?roleId=69ae104c3676fb0108b7e24c

Tax Pack 1 (W-2 + Additional Income)  
👉 Start Tax Pack 1 Filing: https://tax.eduardoservices4u.com/signup/?roleId=69aee1bc3676fb0108b7eaf7

Tax Pack 2 (QuickBooks Integration)  
👉 Start Tax Pack 2 Filing: https://tax.eduardoservices4u.com/signup/?roleId=69aee2453676fb0108b7eb02

---

## Navigation Logic

- Users should NEVER see raw URLs  
- All navigation is triggered by labeled actions (👉 …)  
- The system resolves the correct destination internally  

---

## Conversion Rule

When a user shows intent:

- Clone0 recommends the correct service  
- Presents the CTA (👉 label)  
- System handles the redirection  

Example:

User: "I work Uber and have a W-2"

Clone0:
"Based on that, this is the best option for you:

👉 Start Tax Pack 1 Filing"

---

## Important

This file does NOT contain URLs.

URL mapping is handled separately in the system (Servicespage.md or backend logic).
