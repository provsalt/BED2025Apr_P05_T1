// adopted from https://github.com/chloeelim/longestmrt adopted styling for svg circle.
import { useEffect } from "react";

export const Circle = ({
                  id,
                  cx,
                  cy,
                  r,
                  fill,
                  stroke,
                  strokeWidth,
                  strokeLinecap,
                  path,
                  delay,
                  loading,
                }) => {
  id = id[2] === "0" ? id.substring(0, 2) + id.substring(3) : id;
  id = id.toUpperCase();
  useEffect(() => {
    const code_arr = path.filter((stations) =>
      stations.split(" ").includes(id)
    );
    const n = path.length;
    const selected = code_arr.length > 0;
    const index = selected ? path.indexOf(code_arr[0]) : null;
    if (selected) {
      const func = () => {
        const a = 237;
        const b = 93;
        const c = 71;
        const d = 189;
        const e = 138;
        const f = 230;
        document.getElementById(id).style.fill = `rgb(${
          a + (d - a) * ((1 + index) / (n + 1))
        },${b + (e - b) * ((1 + index) / (n + 1))},${
          c + (f - c) * ((1 + index) / (n + 1))
        })`;
      };
      const timeout = setTimeout(func, (index + 1.5) * delay);
      return () => clearTimeout(timeout);
    }
  }, [path]);

  return (
    <circle
      id={id}
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      className={loading ? "loading" : ""}
    ></circle>
  );
}
