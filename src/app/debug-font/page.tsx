
import { prisma } from "@/lib/prisma";

export default async function DebugFontPage() {
  // 1. Ambil Setting Global
  let setting: any = await prisma.setting.findUnique({ where: { id: "default" } });
  let activeTheme = "unknown";
  let themeConfig = null;

  if (setting) {
      activeTheme = setting.activeTheme || "modern";
      
      // 2. Ambil Theme Config
      // @ts-ignore
      themeConfig = await prisma.themeConfig.findUnique({
          where: { themeId: activeTheme }
      });

      // 3. Merge
      if (themeConfig && themeConfig.config) {
          setting = {
              ...setting,
              ...(themeConfig.config as object)
          };
      }
  }

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Debug Font Settings</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Server Side Settings</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              activeTheme,
              headingFont: setting?.headingFont,
              bodyFont: setting?.bodyFont,
              themeConfigFound: !!themeConfig,
              themeConfigData: themeConfig?.config
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white border p-4 rounded">
          <h2 className="font-bold mb-2">Browser Computed Styles</h2>
          <p>Heading Font (Preview): <span style={{ fontFamily: 'var(--font-heading)' }} className="text-xl">The Quick Brown Fox</span></p>
          <p>Body Font (Preview): <span style={{ fontFamily: 'var(--font-body)' }}>The Quick Brown Fox</span></p>
          
          <div className="mt-4 p-2 bg-yellow-50 text-sm">
             Inspect Element on these elements to see if variables are defined!
          </div>
        </div>
      </div>
    </div>
  );
}
