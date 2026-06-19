import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <div className="mb-8 flex justify-center">
              <PreviousLink className="border-b border-ink/30 pb-1 text-xs uppercase tracking-[0.22em] text-ink/60 transition-colors duration-[var(--motion-feedback)] hover:border-gold hover:text-ink">
                {isLoading ? 'Loading...' : <span>Load previous</span>}
              </PreviousLink>
            </div>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <div className="mt-12 flex justify-center md:mt-16">
              <NextLink className="border border-ink/25 px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition-colors duration-[var(--motion-feedback)] hover:border-ink hover:bg-ink hover:text-ivory">
                {isLoading ? 'Loading...' : <span>Load more</span>}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
