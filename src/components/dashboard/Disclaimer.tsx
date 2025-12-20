import { AlertTriangle } from "lucide-react";

export const Disclaimer = () => {
  return (
    <div className="mt-8 flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Medical Disclaimer
        </p>
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          This tool provides general wellness guidance based on public health guidelines (ADA, AHA). 
          It is not a substitute for professional medical advice, diagnosis, or treatment. 
          Always consult your healthcare provider for medical decisions. 
          All data shown is synthetic for demonstration purposes.
        </p>
      </div>
    </div>
  );
};
