import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/input";

export default function SearchBar({ round = false, hideSubmitBtn = false }) {
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-[150px] md:w-auto max-w-[200px] items-center space-x-2"
    >
      <Input
        type="text"
        placeholder="&#128269; Search"
        className={`shadow-none dark:border-[#333] ${round ? "rounded-full" : ""}
        ${
          loading ? "opacity-60 pointer-events-none cursor-wait" : "opacity-100"
        }`}
      />

      {!hideSubmitBtn && (
        <button
          type="submit"
          disabled={loading}
          className="flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:text-[#f7f7f7]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      )}
    </form>
  );
}
SearchBar.propTypes = { round: PropTypes.bool, hideSubmitBtn: PropTypes.bool };
