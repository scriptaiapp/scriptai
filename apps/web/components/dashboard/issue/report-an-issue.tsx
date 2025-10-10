"use client";
import React from "react";
import { issueTypes } from "../../../../../packages/ui/src/utils/data"
import { Button } from "../../ui/button"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "../../ui/textarea";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { IconBugFilled } from "@tabler/icons-react";



const ReportIssue = ({useIcon}:{useIcon:boolean}) => {
  const [subject, setSubject] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sendingMail, setSendingMail] = React.useState<boolean>(false)
  const handleSendEmail = async (e: Event) => {
    e.preventDefault();
    setSendingMail(true)
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject, email: email || "", body: body })
      })
      if (!response.ok) throw new Error("Failed to generate referral code")
      const data = await response.json()
      toast.success("Referral code generated!", { description: `Your code: ${data.referralCode}` })

    } catch (error: any) {
      toast.error("Error generating referral code", { description: error.message })
    } finally {
      setSendingMail(false)
    }
  };
  return (
    <Popover >
      <PopoverTrigger asChild>
        {useIcon ? <div className="fixed bottom-0 right-0 z-50 w-14  h-14 bg-[#8e8c8c] rounded-full flex items-center justify-center mr-8 mb-48 sm:mb-24 sm:mr-24 cursor-pointer shadow-md">
          <IconBugFilled className="text-black w-10 h-10" />
        </div>: <p className="text-sm text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 transition-colors hover:text-purple-500 cursor-pointer">Report an Issue</p>
      }
        </PopoverTrigger>
      <PopoverContent className="min-h-48 w-96" side="top" align="center">
        <PopoverClose asChild>
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 rounded-full opacity-70 hover:opacity-100">
            X
          </Button>
        </PopoverClose>
        <form className="space-y-4" onSubmit={
          (e) => handleSendEmail(e as unknown as Event)
        }>
          <h4 className="font-medium leading-none">Report an issue</h4>
          <div> <p className='text-sm  dark:text-slate-100 transition-colors text-purple-500 mb-2'>Feedback Type</p>
            <Select onValueChange={(value) => setSubject(value)} >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>

                {
                  issueTypes.map((issue) => (
                    <SelectItem key={issue.value} value={issue.value}>{issue.label}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select></div>
          <div>
             <p className='text-sm  dark:text-slate-100 transition-colors text-purple-500 mb-2'>
              Your Email
              </p>
              <Input type="email" placeholder='Please enter your email' value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
          <div>
             <p className='text-sm  dark:text-slate-100 transition-colors text-purple-500 mb-2'>
              Your Feedback
              </p>
              <Textarea className='min-h-40' placeholder='Please describe any feebdack issue you have for scriptai' value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
          <div className="flex justify-between items-center">
            <PopoverClose asChild>
              <Button variant="outline" size="sm">Close</Button>
            </PopoverClose>
            <Button size="sm" disabled={sendingMail}>
                 {sendingMail ? "Sending Mail..." : "Submit"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default ReportIssue