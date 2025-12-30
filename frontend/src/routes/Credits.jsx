import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

export function Credits() {
  return (
    <div className="flex flex-col flex-1">
      <PageContainer>
        <PageHeader
          breadcrumbs={[{ label: "Credits" }]}
          title="Credits"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Technologies Used</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Frontend:</strong> React 19, Vite, Tailwind CSS</p>
              <p><strong>Backend:</strong> Node.js, Express.js</p>
              <p><strong>Database:</strong> Microsoft SQL Server</p>
              <p><strong>Real-time:</strong> Socket.IO</p>
              <p><strong>Traceability: </strong>Grafana with Loki, Tempo and Prometheus</p>
              <p><strong>Deployment: </strong>Docker with Docker Compose</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Design System:</strong> Radix UI</p>
              <p><strong>Component Library:</strong> shadcn/ui</p>
              <p><strong>Icons:</strong> Lucide React</p>
              <p><strong>Charts:</strong> Recharts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>AI Services:</strong> OpenAI</p>
              <p><strong>Email Service:</strong> Resend</p>
              <p><strong>File Storage:</strong> AWS S3 / MinIO</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other references</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><a className="border-b-2 border-b-primary" href="https://github.com/chloeelim/longestmrt">MRT Map.</a> Frontend for the MRT map</p>
              <p><a className="border-b-2 border-b-primary" href="https://chat.openai.com">ChatGPT</a>: Majority of the frontend code</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Source Libraries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Form Handling:</strong> React Hook Form</p>
              <p><strong>Validation:</strong> Zod</p>
              <p><strong>Routing:</strong> React Router</p>
              <p><strong>API Documentation & Testing:</strong> Swagger & Vitest</p>
              <p><strong>Code Quality:</strong> ESLint, Prettier</p>
              <p><strong>Image Processing:</strong> Sharp</p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}