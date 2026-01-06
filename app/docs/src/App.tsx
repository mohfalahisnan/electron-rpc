import React, { type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import docsContent from './docs.md?raw';
import './App.css';

const CustomAlert = ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => {
  const content = React.Children.toArray(children);
  const firstChild = content[0];

  let title: ReactNode = null;
  let body: ReactNode[] = [];
  let variant: "default" | "destructive" = "default";

  let isExtracted = false;

  if (React.isValidElement(firstChild) && firstChild.type === 'p') {
    // Cast strict to allow accessing props.children
    const pProps = (firstChild as ReactElement<{ children?: ReactNode }>).props;
    const pChildren = React.Children.toArray(pProps.children);
    const potentialTitle = pChildren[0];

    if (React.isValidElement(potentialTitle) && potentialTitle.type === 'strong') {
      // Cast strict to allow accessing props.children
      title = (potentialTitle as ReactElement<{ children?: ReactNode }>).props.children;
      const restOfFirstParagraph = pChildren.slice(1);

      if (restOfFirstParagraph.length > 0) {
        body = [
          <p key="first-p">{restOfFirstParagraph}</p>,
          ...content.slice(1)
        ];
      } else {
        body = content.slice(1);
      }
      isExtracted = true;

      const titleString = String(title).toLowerCase();
      if (titleString.includes('warning') || titleString.includes('error') || titleString.includes('caution')) {
        variant = "destructive";
      }
    }
  }

  if (!isExtracted) {
    body = content;
    title = "Note";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const { cite, ...alertProps } = props as any; // Cast to any to avoid partial prop mismatch, or just pick known props
  return (
    <Alert variant={variant} className="my-4" {...alertProps}>
      <AlertDescription className='py-0'>
        {body}
      </AlertDescription>
    </Alert>
  );
};

function App() {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-xl font-bold">@mavolostudio/electron-rpc</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#introduction">Introduction</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#installation">Installation</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#usage">Usage</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#api-reference">API Reference</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="overflow-auto p-8">
          <div className="max-w-4xl mx-auto text-left prose dark:prose-invert">
            <ReactMarkdown
              rehypePlugins={[rehypeSlug]}
              components={{
                blockquote: CustomAlert
              }}
            >
              {docsContent}
            </ReactMarkdown>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
