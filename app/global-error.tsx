"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
          <Card className="shadow-lg">
            <CardContent>
              <h1 className='text-xl font-medium'>
                Sorry {':('}
              </h1>
              <p className='text-lg text-gray-600'>
                Something went wrong! Please reload the page.
              </p>
              <Button onClick={() => window.location.reload()} className='mt-2 ml-80 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full'>
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}