import { SpaceChildLogo, SpaceChildIcon } from "./SpaceChildLogo";
import { SpaceChildAppIcon } from "./SpaceChildAppIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BrandShowcase() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Space Child Brand Assets</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Logo Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Large Logo with Text</p>
            <div className="p-4 bg-background rounded-lg border">
              <SpaceChildLogo size="lg" showText={true} />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Medium Logo</p>
            <div className="p-4 bg-background rounded-lg border">
              <SpaceChildLogo size="md" showText={true} />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Small Logo</p>
            <div className="p-4 bg-background rounded-lg border">
              <SpaceChildLogo size="sm" showText={true} />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Icon Only Variations</p>
            <div className="p-4 bg-background rounded-lg border flex items-center space-x-4">
              <SpaceChildLogo size="sm" showText={false} />
              <SpaceChildLogo size="md" showText={false} />
              <SpaceChildLogo size="lg" showText={false} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>App Icons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">App Icon - Rounded</p>
            <div className="p-4 bg-muted rounded-lg">
              <SpaceChildAppIcon size={128} variant="rounded" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">App Icon - Square</p>
            <div className="p-4 bg-muted rounded-lg">
              <SpaceChildAppIcon size={128} variant="square" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Small Icons</p>
            <div className="p-4 bg-muted rounded-lg flex items-center space-x-4">
              <SpaceChildIcon size={24} className="text-primary" />
              <SpaceChildIcon size={32} className="text-primary" />
              <SpaceChildIcon size={48} className="text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">On Dark Background</p>
            <div className="p-8 bg-gray-900 rounded-lg">
              <SpaceChildLogo size="md" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">On Light Background</p>
            <div className="p-8 bg-gray-100 rounded-lg">
              <SpaceChildLogo size="md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}