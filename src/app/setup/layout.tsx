'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { find } from 'lodash-es'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const setupSteps = [
  {
    name: 'Create',
    href: '/setup/create',
    canBeSkipped: false,
  },
  {
    name: 'Save',
    href: '/setup/save',
  },
  {
    name: 'Deploy',
    href: '/setup/deploy',
  },
  {
    name: 'Project',
    href: '/setup/project',
  },
  {
    name: 'Import',
    href: '/setup/import',
  },
]

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="container max-w-3xl">
      <div className="mb-6 flex justify-center">
        <Breadcrumb>
          <BreadcrumbList>
            {setupSteps.map((step, i) => {
              const currentStep = find(setupSteps, (s) => s.href === pathname)

              return (
                <Fragment key={step.href}>
                  <BreadcrumbItem>
                    {step.href !== pathname &&
                    currentStep?.canBeSkipped !== false ? (
                      <BreadcrumbLink href={step.href}>
                        {step.name}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{step.name}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {i !== setupSteps.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {children}
    </div>
  )
}
