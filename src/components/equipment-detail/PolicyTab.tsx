
const PolicyTab = () => {
  return (
    <div className="pt-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Cancellation Policy</h3>
          <p className="text-sm text-muted-foreground">
            Cancellations may be subject to the owner's specific terms.
            Please contact the owner directly.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Insurance</h3>
          <p className="text-sm text-muted-foreground">
            Please contact the gear owner to discuss insurance options.
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
