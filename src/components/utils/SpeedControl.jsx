import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SpeedControls = memo(function SpeedControls({
  animationSpeed,
  setAnimationSpeed,
  isAnimating,
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-white font-medium">Speed:</label>
      <Select
        value={animationSpeed.toString()}
        onValueChange={(value) => setAnimationSpeed(parseInt(value))}
        disabled={isAnimating}
      >
        <SelectTrigger className="w-32 bg-neutral-800 text-white border-neutral-600 focus:border-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-neutral-800 border-neutral-600">
          <SelectItem value="2000" className="text-white hover:bg-neutral-700">
            Super Slow
          </SelectItem>
          <SelectItem value="1200" className="text-white hover:bg-neutral-700">
            Slow
          </SelectItem>
          <SelectItem value="800" className="text-white hover:bg-neutral-700">
            Medium
          </SelectItem>
          <SelectItem value="400" className="text-white hover:bg-neutral-700">
            Fast
          </SelectItem>
          <SelectItem value="200" className="text-white hover:bg-neutral-700">
            Very Fast
          </SelectItem>
          <SelectItem value="50" className="text-white hover:bg-neutral-700">
            Lightning
          </SelectItem>
          <SelectItem value="1" className="text-white hover:bg-neutral-700">
            Instant
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

export default SpeedControls;
