"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")

  const handleBack = () => {
    if (returnUrl) {
      router.push(returnUrl)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar ao checkout
    </Button>
  )
}
