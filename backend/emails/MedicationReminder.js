import React from "react";
import { Html, Body, Container, Text } from "@react-email/components";

export default function MedicationReminderEmail({ name, medicine_name, dosage, reason }) {
  return React.createElement(
    Html,
    null,
    React.createElement(
      Body,
      null,
      React.createElement(
        Container,
        null,
        React.createElement(Text, null, `Hi ${name},`),
        React.createElement(Text, null, "This is your reminder to take your medication:"),
        React.createElement(
          Text,
          null,
          React.createElement("strong", null, "Medicine:"), " ", medicine_name,
          React.createElement("br"),
          React.createElement("strong", null, "Dosage:"), " ", dosage,
          React.createElement("br"),
          React.createElement("strong", null, "Reason:"), " ", reason
        )
      )
    )
  );
} 