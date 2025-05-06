
const PolicyTab = () => {
  return (
    <div className="pt-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Cancellation Policy</h3>
          <p className="text-sm text-muted-foreground">
            Full refund if canceled at least 24 hours before the scheduled demo time.
            50% refund if canceled between 12-24 hours before the demo.
            No refund for cancellations less than 12 hours before.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Insurance</h3>
          <p className="text-sm text-muted-foreground">
            Equipment is covered under DemoStoke's insurance policy during the demo period.
            Renters are responsible for any damage beyond normal wear and tear.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Safety Guidelines</h3>
          <p className="text-sm text-muted-foreground">
            All renters must have appropriate experience level for the equipment.
            Follow local regulations and safety guidelines during use.
            Always wear appropriate safety equipment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyTab;
