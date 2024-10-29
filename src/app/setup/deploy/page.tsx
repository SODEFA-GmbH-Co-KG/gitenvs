import { DeployCustom } from '@/components/DeployCustom'
import { DeployVercel } from '@/components/DeployVercel'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your hosting provider</h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl">Easy deployment via CLI</h2>
        <p className="ml-4 text-sm">
          We can deploy the environment variables to these providers
          automatically.
        </p>
        <Collapsible>
          <div className="flex flex-col items-center justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="self-center">
                🚀 Deploy to Vercel
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <DeployVercel />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex flex-row items-center gap-4">
        <div className="h-[1px] w-full bg-white"></div>
        <span>or</span>
        <div className="h-[1px] w-full bg-white"></div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Custom hosting provider</h2>
        <p className="ml-4 text-sm">
          These are the only{' '}
          <span className="font-bold">environment variables</span> that you have
          to set at your hosting provider.
        </p>

        <Collapsible>
          <div className="flex flex-col items-center justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline">Show me how</Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <DeployCustom />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button asChild>
        <Link href="/setup/project">Done</Link>
      </Button>
    </div>
  )
}
