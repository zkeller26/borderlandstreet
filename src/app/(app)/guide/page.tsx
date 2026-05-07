import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

const FAQS = [
  {
    q: "What counts as a poster action?",
    a: "Hanging an official Borderland poster anywhere with a steady stream of people — coffee shops, bars, restaurants, college bulletin boards, telephone poles, community boards. The poster must be visible in the photo and you must drop a GPS pin so admins can verify the location. +10 pts when approved.",
  },
  {
    q: "What counts as an event promo?",
    a: "Showing up to a concert or music event with a stack of Borderland flyers and handing them out. Snap a photo of yourself with the flyers in hand, log the event name, venue, and roughly how many you handed out. Tell us how the crowd reacted — that intel is gold for us. +150 pts when approved.",
  },
  {
    q: "What counts as a social post?",
    a: "Anything you post on your own social account that promotes Borderland: a story, feed post, TikTok, Reddit thread, or a share into a relevant group. Upload a screenshot of the post and tell us where it ran. +20 pts when approved. Authenticity matters — quality posts in niche music groups beat generic ones.",
  },
  {
    q: "How do I order more posters or flyers?",
    a: "Open the hamburger menu (top right) and tap Request Posters or Request Flyers. Tell us how many and any deadline. We ship to the address on your profile, so keep it up to date.",
  },
  {
    q: "What if I have an issue flyering at an event?",
    a: "Message admin through the hamburger menu. Whether it's a venue not letting you in, running out of flyers mid-show, or you're not sure if a spot is allowed — we'd rather hear about it than have you guess.",
  },
  {
    q: "What happens when I hit 1000 points?",
    a: "Your dashboard will unlock the free ticket banner. We'll reach out via email with redemption instructions before the festival. You can DM admin if you don't hear from us within a couple days of hitting the goal.",
  },
  {
    q: "How long does it take to get my submissions approved?",
    a: "Usually within 24 hours, often much faster. If something's been sitting in pending for more than 48h, message admin to nudge.",
  },
  {
    q: "What if my submission gets rejected?",
    a: "Admins leave a reason when rejecting. The most common ones: photo too blurry to verify, no GPS pin on a poster, or unclear what the action was. Just submit a new one with the fix.",
  },
  {
    q: "Can I post on a friend's social account or another team member's account?",
    a: "No — only post on accounts you control. The point is you're using your own reach. Cross-posting between team members would just inflate numbers without expanding the audience.",
  },
  {
    q: "How does the GPS pin work?",
    a: "When you tap Drop a Pin on the poster upload, your phone shares its current GPS coordinates with us. The location is only stored on the submission for admins to verify; we don't track you in the background.",
  },
  {
    q: "Do photos need to include me?",
    a: "Posters: just the poster on the wall is fine. Event promos: please include yourself with the flyers — it confirms you were actually there. Social: a screenshot of the post is enough.",
  },
  {
    q: "What's the deadline?",
    a: "All submissions need to be approved before the festival weekend. Don't wait until the last week — we won't have time to ship more posters or process a flood of last-minute uploads.",
  },
] as const;

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mb-1 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-ember" />
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Street Team Guide
        </h1>
      </div>
      <p className="mb-6 text-sm text-fg-muted">
        Everything you need to know to crush your goal.
      </p>

      <div className="space-y-3">
        {FAQS.map(({ q, a }, i) => (
          <Card key={i} className="p-5">
            <h2 className="text-base font-semibold text-fg">{q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{a}</p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-fg-subtle">
        Still stuck? Hit Message Admin in the menu.
      </p>
    </div>
  );
}
