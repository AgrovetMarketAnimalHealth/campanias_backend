<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ClienteCampania;
use App\Models\Campania;
use Illuminate\Support\Str;

class AsignarClientesPromoConcierto extends Command{
    protected $signature = 'campania:asignar-clientes-promo';
    protected $description = 'Asigna los 95 clientes a la campaña Promo Concierto';
    public function handle(){
        $campaniaId = '019e4645-2389-71dc-ba7a-b7dcdfa23b5c';

        $campania = Campania::find($campaniaId);
        if (!$campania) {
            $this->error("❌ Campaña no encontrada: $campaniaId");
            return 1;
        }

        $this->info("📢 Campaña encontrada: " . $campania->nombre);

        $clientesIds = [
            '019cb521-0153-7150-b8c8-a34b7e3ee4ea',
            '019cb536-2206-7187-9bc9-98c5586639f6',
            '019cb537-89cc-70ce-bae0-3062c59f9705',
            '019cb546-ce97-713f-8e57-3654389fd847',
            '019cb923-3a1a-7247-bef1-cae9f62effb0',
            '019cb9ff-c735-706e-8ab4-426d9342921b',
            '019cbaeb-db6b-737e-936b-fc3498cd8241',
            '019cbfe3-a477-7192-9efe-ee769d021707',
            '019cc3ec-a0aa-71e1-96b4-84621f7e7a5c',
            '019cc3fc-4417-7243-bd36-861f5ca609ad',
            '019cc401-131b-734b-b0bb-f4b19570aeed',
            '019cc426-57b0-73e7-94f3-ac67f03b11b7',
            '019cc4f3-b01f-7080-8377-c1aa930ef8c3',
            '019cc507-ffa4-72b8-aa17-e5d7af246297',
            '019cc516-e6fd-72e8-8ea9-9ecefea0dedc',
            '019cc51c-c990-719b-848e-d6c06e5b70df',
            '019cc562-1544-7094-a4ef-77f2e84d93a6',
            '019cc56c-7637-71bb-a4d7-7399418efd4b',
            '019cd892-5770-701a-9688-b634e81ef174',
            '019ce2d5-9ebf-7249-bb78-b393f3063517',
            '019ce428-6f89-706b-bbb5-dea4f294e8d1',
            '019ce851-5ca6-705c-b5aa-100b3037ccf2',
            '019ce902-3058-721f-b3bd-30b66cc74218',
            '019ce905-2a79-7145-9f4c-e2360d03a207',
            '019ce909-791e-7282-abed-9c6983758ef8',
            '019ce91c-a76d-7082-bc18-db80ef1dd26e',
            '019ce920-a3c1-72aa-9b06-80a536311b31',
            '019ce926-3496-71ff-ae20-1357182ede3e',
            '019ce959-85c2-7298-82a7-8afbf8250a1d',
            '019ce970-caea-7290-bf35-b77ec7621b6d',
            '019ce98b-fd5e-7239-9977-424b98b55900',
            '019ceef1-94af-7143-ba04-b835d6995d45',
            '019cf740-b580-7309-b94b-8dad66820b3e',
            '019cf759-5d82-7096-9876-278c06f9f3a8',
            '019cf759-a436-7132-acaf-f85112940a1a',
            '019cf76b-1905-70cc-a859-01d71e354712',
            '019cf858-c42b-7075-a17b-72626b5895f5',
            '019cf907-6d0b-71f2-85de-93499fdcc715',
            '019cf920-ba97-7156-a111-0cda979075da',
            '019cfcd8-0a0d-70ef-ac46-851a6da5bb1e',
            '019cfcee-c189-7279-bdf3-af68293e0408',
            '019cfdb6-2c29-72be-8059-0d05e756fd7e',
            '019cfdc3-5ffa-7205-996d-f5699f8cc1f8',
            '019d0131-ef01-7172-8b37-ac31c710fb4f',
            '019d0199-7e8a-72ff-8707-e70e9b3a9e03',
            '019d02ed-9d82-71a1-93f3-ab278eec1b76',
            '019d02ee-7507-732e-af11-37698af37c23',
            '019d0341-629e-71f5-9f3b-05d4a1e8c1bc',
            '019d037b-5f95-73cd-abaf-a0dfab258018',
            '019d0382-07c3-7398-8810-e544ee8aafee',
            '019d0675-c217-70fe-a911-557ea122d19c',
            '019d068b-aed0-705d-adfd-22ba5a79059b',
            '019d06b0-72ad-72bd-897f-f4e0f0b66f18',
            '019d06c7-79a7-72d3-8582-60cdcdc4fcf4',
            '019d06d1-b421-7333-b8c4-33fd55590752',
            '019d06db-e046-7286-96be-3e1c372b55c7',
            '019d06e5-c912-7225-be69-335dbb72a41d',
            '019d070e-4b38-7070-97f2-f324e53d3143',
            '019d071e-28f7-7335-a8c9-bdb96c49ba9f',
            '019d0737-c62e-7222-b725-6a4fd1bee47c',
            '019d0739-fa1e-7073-8e3a-c85fdf5118d7',
            '019d0797-4697-714a-bcc6-ef7651bad81c',
            '019d079c-af98-739e-aaac-74c47e568ece',
            '019d0808-0a22-72cc-b04b-60096ab0a57e',
            '019d0831-9964-72ee-995a-86ca80fc239e',
            '019d08bd-2a21-71d6-a543-6e85ec36bab6',
            '019d0c17-f715-731c-885e-295146db5d1a',
            '019d0c1e-8742-71ea-8d77-cc7b99714b06',
            '019d0d3e-1d82-72a0-95c4-2b19459dc25b',
            '019d1ba0-b9ed-721a-9ee2-82c3e04cbb23',
            '019d25df-590a-71e3-8789-bffbf3ae8367',
            '019d2697-e5ae-70a6-8a83-b8e7d4ba14c8',
            '019d2c76-19be-70bb-8e82-5fdce1a5e325',
            '019d3049-73b2-7235-8b09-c3b5616ae368',
            '019d31e2-1aea-70a9-8ab9-2d238f6b2f60',
            '019d5028-3124-7154-ac49-4f77cca18d43',
            '019d6356-449a-73b0-ace9-6cb02211cbd0',
            '019d63a7-f8a4-73da-abd0-97e93c4c91fd',
            '019d6978-e8b8-713f-8181-69d268993c7e',
            '019d73a6-2754-7240-9680-708b36d01529',
            '019d779f-3c23-72cd-a0dc-48edbd989ba7',
            '019db12d-c867-706b-aed7-804a9f737ae7',
            '019db22a-916a-71f1-bfa5-978208b83344',
            '019dbbda-7849-7359-8722-c5b4fe3b5ae2',
            '019dc51c-9942-7366-a3db-e60dd565883c',
            '019dcf97-e638-70fb-8397-8c79df2499ab',
            '019dd087-c686-701c-b122-4874df711ded',
            '019de035-48a8-7359-9b25-dae7ead58fe5',
            '019de071-653d-7350-aa13-4c72404f299b',
            '019de14a-61eb-708b-99f1-7e41ad66c085',
            '019df4be-dc47-71ad-99af-adfd48ea8554',
            '019df93a-e94a-738d-88a9-03832cd913ed',
            '019dfbb1-1706-7236-a6ff-7d0a49e69f76',
            '019dfbbb-a0d0-7028-8e00-606e5f77c592',
            '019dfe34-57ae-72de-9342-e996b97cb025',
        ];

        $totalClientes = count($clientesIds);
        $this->info("📋 Total de clientes a procesar: $totalClientes");
        $this->newLine();

        $insertados = 0;
 $omitidos = 0;
        $errores = 0;

        $bar = $this->output->createProgressBar($totalClientes);
        $bar->start();

        foreach ($clientesIds as $clienteId) {
            try {
                $existe = ClienteCampania::where('cliente_id', $clienteId)
                    ->where('campania_id', $campaniaId)
                    ->exists();

                if ($existe) {
                    $omitidos++;
                } else {
                    ClienteCampania::create([
                        'id' => (string) Str::uuid(),
                        'cliente_id' => $clienteId,
                        'campania_id' => $campaniaId,
                    ]);
                    $insertados++;
                }
            } catch (\Exception $e) {
                $errores++;
                $this->newLine();
                $this->warn("Error con cliente $clienteId: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Mostrar resumen
        $this->info("═══════════════════════════════════════════════════");
        $this->info("PROCESO COMPLETADO");
        $this->info("═══════════════════════════════════════════════════");
        $this->info("Campaña: {$campania->nombre}");
        $this->info("ID Campaña: $campaniaId");
        $this->info("───────────────────────────────────────────────────");
        $this->info("Insertados: $insertados");
        $this->info("⏭Omitidos (ya existían): $omitidos");
        if ($errores > 0) {
            $this->error("Errores: $errores");
        }
        $this->info("Total procesados: " . ($insertados + $omitidos + $errores));
        $this->info("═══════════════════════════════════════════════════");

        return 0;
    }
}