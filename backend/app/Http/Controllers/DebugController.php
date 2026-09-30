<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DebugController extends Controller
{
    public function importDebug(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240',
            'delimiter' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        
        try {
            $rows = [];
            
            if (in_array($extension, ['xlsx', 'xls'])) {
                // Use PhpSpreadsheet directly
                if (class_exists('PhpOffice\PhpSpreadsheet\IOFactory')) {
                    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
                    $worksheet = $spreadsheet->getActiveSheet();
                    $data = $worksheet->toArray();
                    
                    if (!empty($data)) {
                        $headers = array_shift($data);
                        foreach ($data as $row) {
                            if (!is_array($row)) {
                                continue;
                            }
                            $combinedRow = [];
                            foreach ($headers as $index => $header) {
                                $value = $row[$index] ?? null;
                                if (is_string($value)) {
                                    $value = trim($value);
                                }
                                $combinedRow[$header] = (is_string($value) && $value === '') ? null : $value;
                            }
                            $rows[] = $combinedRow;
                        }
                    }
                } else {
                    throw new \Exception('PhpSpreadsheet not installed');
                }
            } else {
                // CSV parsing
                $handle = fopen($file->getRealPath(), 'r');
                if ($handle) {
                    $headers = fgetcsv($handle);
                    while (($row = fgetcsv($handle)) !== false) {
                        $combinedRow = [];
                        foreach ($headers as $index => $header) {
                            $combinedRow[$header] = $row[$index] ?? null;
                        }
                        $rows[] = $combinedRow;
                    }
                    fclose($handle);
                }
            }

            return response()->json([
                'file_name' => $file->getClientOriginalName(),
                'extension' => $extension,
                'total_rows' => count($rows),
                'headers' => !empty($rows) ? array_keys($rows[0]) : [],
                'first_row' => $rows[0] ?? null,
                'all_rows_count' => count($rows),
                'sample_rows' => array_slice($rows, 0, 3),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Erreur lors de la lecture du fichier',
            ], 422);
        }
    }
}
