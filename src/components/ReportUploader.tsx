import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileUp, Check, X } from "lucide-react";

interface ReportUploaderProps {
  patientId: string;
  uploadedByRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportUploader({ patientId, uploadedByRole, onClose, onSuccess }: ReportUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [reportType, setReportType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!files.length || !user) return;
    setUploading(true);

    try {
      const dateGroup = new Date().toISOString().split("T")[0];

      for (const file of files) {
        const filePath = `${patientId}/${dateGroup}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-reports")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("medical-reports")
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("report_files").insert({
          patient_id: patientId,
          date_group: dateGroup,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          report_type: reportType || null,
          uploaded_by_role: uploadedByRole,
          uploaded_by_id: user.id,
        });

        if (dbError) throw dbError;
      }

      setDone(true);
      toast({ title: "Reports uploaded successfully!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-elevated p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Upload Complete!</h3>
          <p className="text-muted-foreground">{files.length} file(s) uploaded successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-elevated p-8 max-w-md w-full border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload Reports
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Report Type (optional)</Label>
            <Input value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="e.g. Blood Test, X-Ray, MRI" />
          </div>

          <div>
            <Label>Files (PDF / Images)</Label>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <Button variant="outline" className="w-full mt-1.5 h-20 border-dashed" onClick={() => fileRef.current?.click()}>
              <div className="text-center">
                <FileUp className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {files.length ? `${files.length} file(s) selected` : "Click to choose files"}
                </span>
              </div>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="text-sm text-muted-foreground flex items-center gap-2 p-2 bg-muted rounded">
                  <FileUp className="w-3 h-3" /> {f.name}
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleUpload} disabled={!files.length || uploading} className="w-full gradient-primary text-primary-foreground">
            {uploading ? "Uploading..." : `Upload ${files.length} File(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
