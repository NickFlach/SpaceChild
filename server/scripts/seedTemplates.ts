import { db } from "../db";
import { projectTemplates } from "@shared/schema";
import { defaultTemplates } from "../data/templates";

async function seedTemplates() {
  console.log("Seeding project templates...");
  
  try {
    // Check if templates already exist
    const existingTemplates = await db.select().from(projectTemplates);
    
    if (existingTemplates.length > 0) {
      console.log(`Found ${existingTemplates.length} existing templates, skipping seed.`);
      return;
    }
    
    // Insert default templates
    const insertedTemplates = await db
      .insert(projectTemplates)
      .values(defaultTemplates)
      .returning();
    
    console.log(`Successfully seeded ${insertedTemplates.length} templates!`);
    
    // Log template names
    insertedTemplates.forEach(template => {
      console.log(`  - ${template.name}`);
    });
    
  } catch (error) {
    console.error("Error seeding templates:", error);
    throw error;
  }
}

// Run the seed function
seedTemplates()
  .then(() => {
    console.log("Template seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Template seeding failed:", error);
    process.exit(1);
  });