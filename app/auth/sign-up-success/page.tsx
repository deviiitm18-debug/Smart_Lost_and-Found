import Link from 'next/link'
import { MapPin, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold text-foreground">CampusFound</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mb-6 text-muted-foreground">
            We{"'"}ve sent you a confirmation link. Click the link in your email to activate your account.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            Back to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
