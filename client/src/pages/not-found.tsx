import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-secondary)] p-4 transition-colors duration-200">
      <Card className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] transition-colors duration-200">
        <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">
                404
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                Page Not Found
              </p>
            </div>
          </div>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-[var(--text-secondary)] mb-6 sm:mb-8">
            Sorry! The page you're looking for doesn't exist. It might have been
            removed or the URL is incorrect.
          </p>

          <Link href="/">
            <Button
              className="w-full font-semibold gap-2 h-10 sm:h-11 text-sm sm:text-base transition-all duration-200"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
