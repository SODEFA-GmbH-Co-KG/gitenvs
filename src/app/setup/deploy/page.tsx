import { DeployCustom } from '@/components/DeployCustom'
import { Hr } from '@/components/Hr'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { DeployVercel } from '@/components/vercel/DeployVercel'
import Image from 'next/image'
import Link from 'next/link'

export default function Page({
  searchParams,
}: {
  searchParams: { teamId?: string; projectId?: string; upsert?: string }
}) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-center text-2xl">Setup your hosting provider</h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl">Easy deployment via CLI</h2>
        <p className="ml-4 text-sm">
          We can deploy the environment variables to these providers
          automatically.
        </p>
        <Collapsible
          defaultOpen={!!searchParams.teamId && !!searchParams.projectId}
        >
          <div className="flex flex-col items-center justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2 self-center">
                <span>Deploy to Vercel</span>
                <Image
                  unoptimized
                  alt="vercel-logo"
                  src="https://vercel.com/favicon.ico"
                  width={20}
                  height={20}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <DeployVercel
              teamId={searchParams.teamId}
              projectId={searchParams.projectId}
              upsert={searchParams.upsert === 'true'}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Hr outerClassName="col-span-full" thin>
        or
      </Hr>

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
