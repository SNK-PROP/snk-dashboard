"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiService } from "@/lib/api";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconMobiledata,
  IconDeviceMobile,
  IconBrandApple,
  IconBrandAndroid,
  IconCalendar,
  IconDownload
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function AppVersionsPage() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);

  // Form state for creating/editing versions
  const [formData, setFormData] = useState({
    platform: "android",
    version: "",
    buildNumber: "",
    isForceUpdate: false,
    updateUrl: "",
    releaseNotes: "",
    minimumSupportedVersion: "",
    features: [],
    bugFixes: [],
    downloadSize: "",
    targetSdkVersion: "",
    minimumOsVersion: ""
  });

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/app/versions');
      setVersions(response.versions || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast.error("Failed to fetch app versions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        buildNumber: parseInt(formData.buildNumber),
        targetSdkVersion: formData.targetSdkVersion ? parseInt(formData.targetSdkVersion) : null,
        features: formData.features.filter(f => f.trim()),
        bugFixes: formData.bugFixes.filter(f => f.trim())
      };

      if (editingVersion) {
        await apiService.put(`/app/versions/${editingVersion._id}`, payload);
        toast.success("Version updated successfully");
      } else {
        await apiService.post("/app/versions", payload);
        toast.success("Version created successfully");
      }

      setShowCreateDialog(false);
      setEditingVersion(null);
      resetForm();
      fetchVersions();
    } catch (error) {
      console.error("Error saving version:", error);
      toast.error(error.response?.data?.message || "Failed to save version");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Are you sure you want to delete this version?")) return;

    try {
      await apiService.delete(`/app/versions/${versionId}`);
      toast.success("Version deleted successfully");
      fetchVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Failed to delete version");
    }
  };

  const handleEditVersion = (version) => {
    setEditingVersion(version);
    setFormData({
      platform: version.platform,
      version: version.version,
      buildNumber: version.buildNumber.toString(),
      isForceUpdate: version.isForceUpdate,
      updateUrl: version.updateUrl,
      releaseNotes: version.releaseNotes || "",
      minimumSupportedVersion: version.minimumSupportedVersion || "",
      features: version.features || [],
      bugFixes: version.bugFixes || [],
      downloadSize: version.downloadSize || "",
      targetSdkVersion: version.targetSdkVersion ? version.targetSdkVersion.toString() : "",
      minimumOsVersion: version.minimumOsVersion || ""
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      platform: "android",
      version: "",
      buildNumber: "",
      isForceUpdate: false,
      updateUrl: "",
      releaseNotes: "",
      minimumSupportedVersion: "",
      features: [],
      bugFixes: [],
      downloadSize: "",
      targetSdkVersion: "",
      minimumOsVersion: ""
    });
  };

  const handleArrayInput = (field, value) => {
    const array = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">App Version Management</h1>
                <p className="text-muted-foreground">Manage mobile app versions and force updates</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchVersions} disabled={loading}>
                  <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) {
                    setEditingVersion(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add Version
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingVersion ? 'Edit Version' : 'Add New Version'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateVersion} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Select 
                            value={formData.platform} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="android">Android</SelectItem>
                              <SelectItem value="ios">iOS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="version">Version</Label>
                          <Input
                            id="version"
                            placeholder="1.0.0"
                            value={formData.version}
                            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="buildNumber">Build Number</Label>
                          <Input
                            id="buildNumber"
                            type="number"
                            placeholder="1"
                            value={formData.buildNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, buildNumber: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="downloadSize">Download Size</Label>
                          <Input
                            id="downloadSize"
                            placeholder="25.4 MB"
                            value={formData.downloadSize}
                            onChange={(e) => setFormData(prev => ({ ...prev, downloadSize: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="updateUrl">Update URL</Label>
                        <Input
                          id="updateUrl"
                          placeholder={formData.platform === 'android' 
                            ? 'https://play.google.com/store/apps/details?id=com.snk.prop'
                            : 'https://apps.apple.com/app/your-app/id123456789'
                          }
                          value={formData.updateUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, updateUrl: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minimumSupportedVersion">Minimum Supported Version</Label>
                          <Input
                            id="minimumSupportedVersion"
                            placeholder="1.0.0"
                            value={formData.minimumSupportedVersion}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimumSupportedVersion: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="minimumOsVersion">Minimum OS Version</Label>
                          <Input
                            id="minimumOsVersion"
                            placeholder={formData.platform === 'android' ? 'Android 7.0' : 'iOS 13.0'}
                            value={formData.minimumOsVersion}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimumOsVersion: e.target.value }))}
                          />
                        </div>
                      </div>

                      {formData.platform === 'android' && (
                        <div>
                          <Label htmlFor="targetSdkVersion">Target SDK Version</Label>
                          <Input
                            id="targetSdkVersion"
                            type="number"
                            placeholder="34"
                            value={formData.targetSdkVersion}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetSdkVersion: e.target.value }))}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isForceUpdate"
                          checked={formData.isForceUpdate}
                          onChange={(e) => setFormData(prev => ({ ...prev, isForceUpdate: e.target.checked }))}
                          className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <Label htmlFor="isForceUpdate">Force Update Required</Label>
                      </div>

                      <div>
                        <Label htmlFor="releaseNotes">Release Notes</Label>
                        <Textarea
                          id="releaseNotes"
                          placeholder="What's new in this version..."
                          value={formData.releaseNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, releaseNotes: e.target.value }))}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="features">Features (one per line)</Label>
                        <Textarea
                          id="features"
                          placeholder="New feature 1&#10;Improved feature 2&#10;Enhanced feature 3"
                          value={formData.features.join('\n')}
                          onChange={(e) => handleArrayInput('features', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bugFixes">Bug Fixes (one per line)</Label>
                        <Textarea
                          id="bugFixes"
                          placeholder="Fixed issue with login&#10;Improved app stability&#10;Performance optimizations"
                          value={formData.bugFixes.join('\n')}
                          onChange={(e) => handleArrayInput('bugFixes', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingVersion ? 'Update Version' : 'Create Version'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Versions List */}
            <div className="grid gap-4">
              {loading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : versions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <IconMobiledata className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No app versions found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first version to enable update management
                    </p>
                  </CardContent>
                </Card>
              ) : (
                versions.map((version) => (
                  <Card key={version._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {version.platform === 'android' ? (
                              <IconBrandAndroid className="h-6 w-6 text-green-600" />
                            ) : (
                              <IconBrandApple className="h-6 w-6 text-gray-600" />
                            )}
                            <h3 className="font-semibold text-lg">
                              {version.platform === 'android' ? 'Android' : 'iOS'} v{version.version}
                            </h3>
                            <Badge variant={version.isActive ? "default" : "secondary"}>
                              {version.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {version.isForceUpdate && (
                              <Badge variant="destructive">Force Update</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Build:</span> {version.buildNumber}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {version.downloadSize || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Min OS:</span> {version.minimumOsVersion || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <IconCalendar className="h-3 w-3" />
                              {new Date(version.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {version.releaseNotes && (
                            <div className="mt-3 p-3 bg-muted rounded text-sm">
                              <strong>Release Notes:</strong>
                              <p className="mt-1 whitespace-pre-line">{version.releaseNotes.substring(0, 200)}
                                {version.releaseNotes.length > 200 && '...'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditVersion(version)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVersion(version._id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}