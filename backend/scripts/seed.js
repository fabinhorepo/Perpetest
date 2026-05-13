import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // ============ CREATE SPECIES ============
  const species = await prisma.species.createMany({
    data: [
      {
        scientificName: 'Handroanthus impetiginosus',
        commonName: 'Ipê Roxo',
        biome: 'Mata Atlântica',
        ecologicalGroup: 'Clímax',
        growthSpeedMonths: 36,
        shadeTolerance: 'Pleno sol',
        photoUrl: 'https://via.placeholder.com/300?text=Ipê+Roxo',
      },
      {
        scientificName: 'Aspidosperma polyneuron',
        commonName: 'Peroba-do-Campo',
        biome: 'Cerrado',
        ecologicalGroup: 'Clímax',
        growthSpeedMonths: 48,
        shadeTolerance: 'Pleno sol',
        photoUrl: 'https://via.placeholder.com/300?text=Peroba',
      },
      {
        scientificName: 'Copaifera langsdorffii',
        commonName: 'Copaíba',
        biome: 'Mata Atlântica',
        ecologicalGroup: 'Secundária',
        growthSpeedMonths: 30,
        shadeTolerance: 'Meia sombra',
        photoUrl: 'https://via.placeholder.com/300?text=Copaíba',
      },
      {
        scientificName: 'Hymenaea courbaril',
        commonName: 'Jatobá',
        biome: 'Amazônia',
        ecologicalGroup: 'Clímax',
        growthSpeedMonths: 48,
        shadeTolerance: 'Pleno sol',
        photoUrl: 'https://via.placeholder.com/300?text=Jatobá',
      },
      {
        scientificName: 'Mimosa caesalpiniifolia',
        commonName: 'Sansão-do-campo',
        biome: 'Cerrado',
        ecologicalGroup: 'Pioneira',
        growthSpeedMonths: 18,
        shadeTolerance: 'Pleno sol',
        photoUrl: 'https://via.placeholder.com/300?text=Sansão',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Created ${species.count} species`);

  // ============ CREATE BATCHES ============
  const speciesRecords = await prisma.species.findMany();
  const batches = await prisma.batch.createMany({
    data: speciesRecords.map((s) => ({
      speciesId: s.id,
      nurseryLocation: 'Viveiro Principal - Setor A',
      productionDate: new Date('2024-01-01'),
      readyFromDate: new Date('2024-03-01'),
      readyToDate: new Date('2024-12-31'),
      totalSeedlings: 10000,
    })),
  });

  console.log(`✓ Created ${batches.count} batches`);

  // ============ CREATE NURSERY STOCK ============
  const batchRecords = await prisma.batch.findMany();
  const stocks = await prisma.nurseryStock.createMany({
    data: batchRecords.map((b) => ({
      batchId: b.id,
      availableQty: 10000,
      reservedQty: 0,
    })),
  });

  console.log(`✓ Created ${stocks.count} stock records`);

  // ============ CREATE PRODUCTS ============
  const products = await prisma.product.createMany({
    data: speciesRecords.map((s) => ({
      speciesId: s.id,
      displayName: `${s.commonName} - Muda com 6 meses`,
      description: `Muda certificada de ${s.commonName} (${s.scientificName}). Ideal para projetos de restauração.`,
      basePrice: 25.0,
      photoUrl: s.photoUrl,
    })),
  });

  console.log(`✓ Created ${products.count} products`);

  // ============ CREATE BUNDLES ============
  const bundles = await prisma.bundle.createMany({
    data: [
      {
        name: 'Bundle Restauração - Mata Atlântica',
        description: 'Seleção recomendada para restauração em bioma Mata Atlântica',
        targetBiome: 'Mata Atlântica',
        targetObjective: 'APP',
      },
      {
        name: 'Bundle Enriquecimento - Cerrado',
        description: 'Espécies para enriquecimento de áreas degradadas no Cerrado',
        targetBiome: 'Cerrado',
        targetObjective: 'RL',
      },
    ],
  });

  console.log(`✓ Created ${bundles.count} bundles`);

  // ============ CREATE BUNDLE ITEMS ============
  const bundleRecords = await prisma.bundle.findMany();
  const productRecords = await prisma.product.findMany();

  const bundleItems = await prisma.bundleItem.createMany({
    data: [
      // Bundle 1 items
      {
        bundleId: bundleRecords[0].id,
        speciesId: speciesRecords[0].id, // Ipê Roxo
        percentageQty: 30,
      },
      {
        bundleId: bundleRecords[0].id,
        speciesId: speciesRecords[2].id, // Copaíba
        percentageQty: 40,
      },
      // Bundle 2 items
      {
        bundleId: bundleRecords[1].id,
        speciesId: speciesRecords[1].id, // Peroba-do-Campo
        percentageQty: 50,
      },
      {
        bundleId: bundleRecords[1].id,
        speciesId: speciesRecords[4].id, // Sansão-do-campo
        percentageQty: 50,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Created ${bundleItems.count} bundle items`);

  // ============ CREATE PRICE LIST ============
  const priceList = await prisma.priceList.create({
    data: {
      name: 'Tabela Padrão 2024',
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
      isDefault: true,
    },
  });

  console.log(`✓ Created price list: ${priceList.name}`);

  // ============ CREATE CUSTOMERS ============
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'João Silva - Viveiro',
        email: 'joao@viveiro.com',
        document: '12345678901',
        type: 'PJ',
        phone: '(11) 98765-4321',
      },
      {
        name: 'Maria Santos - Restauração Ambiental',
        email: 'maria@restauracao.com',
        document: '98765432100',
        type: 'PF',
        phone: '(11) 99876-5432',
      },
    ],
  });

  console.log(`✓ Created ${customers.count} customers`);

  // ============ CREATE PROJECTS ============
  const customerRecords = await prisma.customer.findMany();
  const projects = await prisma.project.createMany({
    data: [
      {
        customerId: customerRecords[0].id,
        name: 'Restauração Mata Atlântica - Fazenda A',
        description: 'Projeto de restauração de 5 hectares de mata degradada',
        biome: 'Mata Atlântica',
        areaSizeHa: 5.0,
        objective: 'APP',
        latitude: -23.5505,
        longitude: -46.6333,
      },
      {
        customerId: customerRecords[1].id,
        name: 'Reserva Legal - Fazenda B',
        description: 'Plantio de mudas para cumprir RL de 20% da propriedade',
        biome: 'Cerrado',
        areaSizeHa: 20.0,
        objective: 'RL',
        latitude: -15.7828,
        longitude: -47.8822,
      },
    ],
  });

  console.log(`✓ Created ${projects.count} projects`);

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
