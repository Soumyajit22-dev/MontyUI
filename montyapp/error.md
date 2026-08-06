[plugin:vite:import-analysis] Failed to resolve import "@/components/ui/toaster" from "src/App.tsx". Does the file exist?
/Users/soumyajitmondal/Documents/monty_UI/montyapp/src/App.tsx:1:24
1  |  import { Toaster } from "@/components/ui/toaster";
   |                           ^
2  |  import { Toaster as Sonner } from "@/components/ui/sonner";
3  |  import { TooltipProvider } from "@/components/ui/tooltip";
    at TransformPluginContext._formatLog (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:31011:39)
    at TransformPluginContext.error (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:31008:14)
    at normalizeUrl (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:27957:18)
    at async file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:28025:30
    at async Promise.all (index 0)
    at async TransformPluginContext.transform (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:27993:4)
    at async EnvironmentPluginContainer.transform (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:30796:14)
    at async loadAndTransform (file:///Users/soumyajitmondal/Documents/monty_UI/montyapp/node_modules/vite/dist/node/chunks/node.js:20594:26)
