import { supabase } from './src/integrations/supabase/client.ts';
import { generateGearDescription } from './src/services/equipment/descriptionAIService.ts';

async function updateGearDescription() {
  const gearId = 'c2bbe123-6f12-4c71-bab7-f0514b96088d';
  
  try {
    // Get the current gear data
    const { data: gear, error: fetchError } = await supabase
      .from('equipment')
      .select('id, name, category, subcategory, description')
      .eq('id', gearId)
      .single();

    if (fetchError) {
      console.error('Error fetching gear:', fetchError);
      return;
    }

    console.log('Current gear:', gear);
    console.log('Current description:', gear.description);

    // Generate new description using AI
    console.log('Generating AI description...');
    const newDescription = await generateGearDescription(gear.name, gear.category);
    
    console.log('Generated description:', newDescription);

    // Update the database with the new description
    const { data: updateData, error: updateError } = await supabase
      .from('equipment')
      .update({ description: newDescription })
      .eq('id', gearId)
      .select();

    if (updateError) {
      console.error('Error updating gear description:', updateError);
      return;
    }

    console.log('Successfully updated gear description!');
    console.log('Updated gear data:', updateData);

  } catch (error) {
    console.error('Error in updateGearDescription:', error);
  }
}

// Run the function
updateGearDescription();