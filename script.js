document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs-RK5zrgpKBUJAKD6pCXmLAfqWgHDSyzY9rgAJMFnvzyO-iyyFRlqVKnhUQQljX_/pub?gid=1829383988&single=true&output=csv';
    let studentData = [];

    const loadingElement = document.getElementById('loading');
    const loginSection = document.getElementById('login-section');
    const nisnInput = document.getElementById('nisn-input');
    const loginButton = document.getElementById('login-button');
    const studentInfoSection = document.getElementById('student-info');
    const namaLengkapSpan = document.getElementById('nama-lengkap');
    const nisnSpan = document.getElementById('nisn');
    const kelasSpan = document.getElementById('kelas');
    const predikatSpan = document.getElementById('predikat');
    const gradesTableContainer = document.getElementById('grades-table-container');
    const gradesTableBody = document.getElementById('grades-table-body');

    const aspectMapping = [
        "LKS BAB 1", "LKS BAB 2", "LKS BAB 3",
        "CATATAN TUGAS BAB 1", "CATATAN TUGAS BAB 2", "CATATAN TUGAS BAB 3",
        "KETERAMPILAN BAB 1", "KETERAMPILAN BAB 2", "KETERAMPILAN BAB 3",
        "ATS LKS", "ATS ASLI", "ATS PERBAIKAN 25 SOAL",
        "AAS LKS", "AAS ASLI",
        "PENILAIAN HARIAN", "NILAI AKHIR ATS", "NILAI AKHIR AAS"
    ];

    const highlightYellowRows = ["PENILAIAN HARIAN", "NILAI AKHIR ATS", "NILAI AKHIR AAS"];

    // Function to parse CSV data
    async function fetchAndParseCSV() {
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            if (lines.length < 2) {
                console.error("CSV data is too short or malformed.");
                loadingElement.textContent = "Gagal memuat data: Data tidak valid.";
                return;
            }

            const headers = lines[0].split(',');
            studentData = lines.slice(1).map(line => {
                const values = line.split(',');
                let row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index] ? values[index].trim() : '';
                });
                return row;
            });
            console.log("Student Data:", studentData); // For debugging

            loadingElement.classList.add('hidden');
            loginSection.classList.remove('hidden');

        } catch (error) {
            console.error("Error fetching or parsing CSV:", error);
            loadingElement.textContent = "Gagal memuat data: " + error.message;
        }
    }

    // Login functionality
    loginButton.addEventListener('click', () => {
        const nisn = nisnInput.value.trim();
        if (nisn) {
            displayStudentGrades(nisn);
        } else {
            alert('Harap masukkan NISN Anda.');
        }
    });

    function displayStudentGrades(nisn) {
        const student = studentData.find(s => s.NISN === nisn);

        if (student) {
            loginSection.classList.add('hidden');
            studentInfoSection.classList.remove('hidden');
            gradesTableContainer.classList.remove('hidden');

            namaLengkapSpan.textContent = student['NAMA LENGKAP'] || '-';
            nisnSpan.textContent = student.NISN || '-';
            kelasSpan.textContent = student.KELAS || '-';
            predikatSpan.textContent = student.PREDIKAT || '-';

            gradesTableBody.innerHTML = ''; // Clear previous data

            // Assuming 'NAMA LENGKAP', 'NISN', 'KELAS', 'PREDIKAT' are fixed columns,
            // and the values for grades start from the 5th column (index 4) based on 'data dimulai dari kolom E'
            // Need to map the aspectMapping to the correct columns in the CSV
            // Based on the given example 'NAMA LENGKAP', 'NISN', 'KELAS', 'PREDIKAT' would be A,B,C,D
            // So, column E would be index 4. The order of columns in CSV is important.
            // Let's assume the CSV columns directly correspond to the order of aspectMapping starting from E.

            // The user provided the spreadsheet structure and also the list of aspects.
            // I need to deduce the column mapping from the spreadsheet.
            // 'NILAI2', header utama berada di row 1, dan data berada di row 2
            // "LKS BAB 1", "LKS BAB 2", ..., "NILAI AKHIR AAS"
            // The request says "data nilai dimulai dari kolom E di spreadsheet".
            // So, I'll map the aspectMapping array to student object keys dynamically.
            // Let's re-evaluate how to get values for each aspect.
            // If the headers in the CSV are exactly "LKS BAB 1", "LKS BAB 2" etc, then we can use them directly.
            // If not, we need to know the exact column names from the CSV.
            // Assuming the headers in the CSV match the aspectMapping for the grade columns.
            // It's safer to use the exact header names from the CSV output.

            // Let's reconstruct the grade aspects based on the column headers in the CSV,
            // assuming the relevant columns are from 'E' onwards in the spreadsheet.
            // In the CSV, this corresponds to indices after 'NAMA LENGKAP', 'NISN', 'KELAS', 'PREDIKAT'.
            // So, the 5th column in spreadsheet (E) corresponds to index 4 in a 0-indexed array of CSV headers.

            const relevantHeaders = Object.keys(student).slice(4); // Get headers from column E onwards assuming A,B,C,D are first 4.

            aspectMapping.forEach(aspect => {
                const row = gradesTableBody.insertRow();
                const aspectCell = row.insertCell(0);
                const valueCell = row.insertCell(1);

                aspectCell.textContent = aspect;

                // Find the corresponding value from the student object
                let value = '';
                // The aspectMapping provided by the user needs to be matched to the actual column headers.
                // Assuming the headers in the CSV starting from column E directly correspond to the aspectMapping order.
                // Or if the specific header names are available in the CSV, use them directly.
                // For simplicity, let's try to match directly by aspect name.
                // If student[aspect] doesn't work, we need a precise mapping.
                // User mentioned "data nilai dimulai dari kolom E". This means the headers in the CSV are not necessarily `LKS BAB 1` directly.
                // Let's assume the CSV headers (after the first four) correspond directly to `aspectMapping` in order.

                let gradeValue = student[aspect]; // Attempt direct match
                if (gradeValue === undefined) {
                    // Fallback if direct match doesn't work, and rely on fixed column order if student object doesn't have exact keys.
                    // This is tricky without knowing the exact CSV header names after column D.
                    // For now, I'll rely on the user providing specific column headers in the `aspectMapping`
                    // and that these *exact* headers exist in the CSV from column E onwards.
                    // Given the prompt "data nilai dimulai dari kolom E di spreadsheet", it implies we need to find the column for each `aspect`.
                    // This is why `relevantHeaders` would be useful, if we could map them to `aspectMapping`.
                    // A safer approach without knowing exact CSV headers would be to assume the order of `aspectMapping`
                    // corresponds to the order of columns starting from E.

                    // Let's find the index of the aspect in the overall header to get the column index.
                    // This would require parsing headers and finding their original index in the CSV.
                    // This is complex without a fixed mapping or exact CSV headers.

                    // REVISED APPROACH: Since `aspectMapping` is provided and distinct, and the data "dimulai dari kolom E",
                    // I will assume that the values for these aspects are in the *same order* as `aspectMapping`
                    // in the CSV, starting from the 5th column (index 4).
                    const aspectIndexInMapping = aspectMapping.indexOf(aspect);
                    if (aspectIndexInMapping !== -1 && relevantHeaders[aspectIndexInMapping]) {
                        gradeValue = student[relevantHeaders[aspectIndexInMapping]];
                    } else {
                        gradeValue = ''; // Not found
                    }
                }

                if (gradeValue !== undefined && gradeValue !== null && gradeValue !== '') {
                    const parsedValue = parseFloat(gradeValue);
                    if (!isNaN(parsedValue)) {
                        value = Math.round(parsedValue);
                    } else {
                        value = ''; // Not a number, treat as missing
                    }
                } else {
                    value = ''; // Treat as missing
                }

                valueCell.textContent = value === '' ? '-' : value; // Display '-' for empty values

                if (highlightYellowRows.includes(aspect)) {
                    row.classList.add('highlight-yellow');
                }

                if (value === '') {
                    row.classList.add('incorrect-row'); // Highlight if value is missing
                }
            });

        } else {
            alert('NISN tidak ditemukan. Harap periksa kembali.');
        }
    }

    // Initial data fetch
    fetchAndParseCSV();
});
