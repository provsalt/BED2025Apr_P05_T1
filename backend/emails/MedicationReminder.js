import React from "react";
import {
  Body,
  Column,
  Container,
  Heading,
  Hr,
  Html,
  Row,
  Section,
  Text,
} from "@react-email/components";

const c = React.createElement;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const header = {
  textAlign: "center",
  marginBottom: "32px",
};

const title = {
  fontSize: "28px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1e3a8a",
  margin: "0",
};

const content = {
  padding: "0 20px",
};

const greeting = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#374151",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const subtitle = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#6b7280",
  margin: "0 0 24px 0",
};

const medicationCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const detailRow = {
  margin: "0 0 8px 0",
};

const iconText = {
  fontSize: "20px",
  margin: "0",
  textAlign: "center",
};

const labelText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e3a8a",
  margin: "0 0 4px 0",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const valueText = {
  fontSize: "16px",
  color: "#111827",
  fontWeight: "500",
  margin: "0",
};

const divider = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "16px 0",
};

const reminderText = {
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#6b7280",
  fontStyle: "italic",
  textAlign: "center",
  margin: "24px 0 0 0",
};

const footerDivider = {
  border: "none",
  borderTop: "2px solid #dbeafe",
  margin: "40px 0 32px 0",
};

const footer = {
  textAlign: "center",
  padding: "0 20px",
};

const footerText = {
  fontSize: "16px",
  color: "#1e3a8a",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const footerSubtext = {
  fontSize: "12px",
  lineHeight: "1.4",
  color: "#9ca3af",
  margin: "0",
};

export default function MedicationReminderEmail({
                                                  name,
                                                  medicine_name,
                                                  dosage,
                                                  reason,
                                                }) {
  return c(
    Html,
    null,
    c(
      Body,
      { style: main },
      c(
        Container,
        { style: container },
        c(
          Section,
          { style: header },
          c(Row, null, c(Column, null, c(Heading, { style: title }, "💊 Medication Reminder")))
        ),
        c(
          Section,
          { style: content },
          c(Text, { style: greeting }, `Hi ${name},`),
          c(
            Text,
            { style: subtitle },
            "This is your friendly reminder to take your medication."
          ),
          c(
            Section,
            { style: medicationCard },
            c(
              Row,
              { style: detailRow },
              c(Column, { width: "40" }, c(Text, { style: iconText }, "💊")),
              c(
                Column,
                null,
                c(Text, { style: labelText }, "Medicine"),
                c(Text, { style: valueText }, medicine_name)
              )
            ),
            c(Hr, { style: divider }),
            c(
              Row,
              { style: detailRow },
              c(Column, { width: "40" }, c(Text, { style: iconText }, "📏")),
              c(
                Column,
                null,
                c(Text, { style: labelText }, "Dosage"),
                c(Text, { style: valueText }, dosage)
              )
            ),
            c(Hr, { style: divider }),
            c(
              Row,
              { style: detailRow },
              c(Column, { width: "40" }, c(Text, { style: iconText }, "🎯")),
              c(
                Column,
                null,
                c(Text, { style: labelText }, "Reason"),
                c(Text, { style: valueText }, reason)
              )
            )
          ),
          c(
            Text,
            { style: reminderText },
            "Please take your medication as prescribed by your healthcare provider."
          )
        ),
        c(Hr, { style: footerDivider }),
        c(
          Section,
          { style: footer },
          c(
            Text,
            { style: footerText },
            "💙 Stay healthy and take care of yourself"
          ),
          c(
            Text,
            { style: footerSubtext },
            "If you have any questions about your medication, please consult your doctor or pharmacist."
          )
        )
      )
    )
  );
}
