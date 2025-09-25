
const Check2 = () => (
    <svg
        fill="#ffffffb7"
        width="14px"
        height="14px"
        viewBox="0 0 24 24"
        id="check-double"
        data-name="Line Color"
        xmlns="http://www.w3.org/2000/svg"
        className="icon line-color"
    >
        <line
            id="secondary"
            x1={13.22}
            y1={16.5}
            x2={21}
            y2={7.5}
            style={{
                fill: "none",
                stroke: "rgba(255, 255, 255, 1)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
            }}
        />
        <polyline
            id="primary"
            points="3 11.88 7 16.5 14.78 7.5"
            style={{
                fill: "none",
                stroke: "rgba(255, 255, 255, 1)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
            }}
        />
    </svg>)
export default Check2;
