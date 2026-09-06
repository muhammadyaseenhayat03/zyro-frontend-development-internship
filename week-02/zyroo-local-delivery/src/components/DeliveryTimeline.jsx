import { STAGES, STAGE_LABELS, stageIndex } from "../data/orders";

const STEP_NOTES = {
  created: "Order placed by customer",
  assigned: "Rider assigned to pickup",
  picked_up: "Package collected from pickup point",
  in_transit: "On the way to delivery address",
  delivered: "Handed over to customer",
};

export default function DeliveryTimeline({ status }) {
  const current = stageIndex(status);

  return (
    <div className="timeline">
      {STAGES.map((stage, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <div className="timeline-step" key={stage}>
            <div className="timeline-marker">
              <div
                className={
                  "timeline-dot" +
                  (done ? " done" : "") +
                  (isCurrent ? " current" : "")
                }
              >
                {done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <div className={"timeline-connector" + (done ? " done" : "")} />
              )}
            </div>
            <div className="timeline-step-body">
              <p className="timeline-step-title">{STAGE_LABELS[stage]}</p>
              <p className="timeline-step-sub">{STEP_NOTES[stage]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
