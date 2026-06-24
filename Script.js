// ================= 1. STARTUP & TABS =================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('i_date').valueAsDate = new Date();
    addTaRow(); 
    document.getElementById('i_pan').addEventListener('blur', autoFillProfile);
});

function switchTab(tabId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('nav-' + tabId).classList.add('active');
    if(tabId === 'history') loadHistory();
}

function doLogin() {
    let dept = document.getElementById('login-dept').value;
    let pass = document.getElementById('login-pass').value;
    if(pass === "") { alert("⚠️ Please enter a password!"); return; }
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('display-dept-name').innerText = "📍 " + dept;
    localStorage.setItem('current_dept', dept);
}

function doLogout() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
}

function saveProfileData() {
    let pan = document.getElementById('i_pan').value.trim().toUpperCase();
    if (!pan) return;
    let profile = {
        name: document.getElementById('i_name').value, desig: document.getElementById('i_desig').value,
        basic: document.getElementById('i_basic').value, inst: document.getElementById('i_inst').value,
        aadhar: document.getElementById('i_aadhar').value, phone: document.getElementById('i_phone').value,
        email: document.getElementById('i_email').value, b_name: document.getElementById('i_b_name').value,
        b_branch: document.getElementById('i_b_branch').value, b_acc: document.getElementById('i_b_acc').value,
        b_ifsc: document.getElementById('i_b_ifsc').value, b_type: document.getElementById('i_b_type').value
    };
    localStorage.setItem('gtu_profile_' + pan, JSON.stringify(profile));
}

function autoFillProfile() {
    let pan = document.getElementById('i_pan').value.trim().toUpperCase();
    if (!pan) return;
    let savedData = localStorage.getItem('gtu_profile_' + pan);
    if (savedData) {
        let p = JSON.parse(savedData);
        document.getElementById('i_name').value = p.name || ''; document.getElementById('i_desig').value = p.desig || '';
        document.getElementById('i_basic').value = p.basic || ''; document.getElementById('i_inst').value = p.inst || '';
        document.getElementById('i_aadhar').value = p.aadhar || ''; document.getElementById('i_phone').value = p.phone || '';
        document.getElementById('i_email').value = p.email || ''; document.getElementById('i_b_name').value = p.b_name || '';
        document.getElementById('i_b_branch').value = p.b_branch || ''; document.getElementById('i_b_acc').value = p.b_acc || '';
        document.getElementById('i_b_ifsc').value = p.b_ifsc || ''; document.getElementById('i_b_type').value = p.b_type || '';
        alert("✅ " + p.name + " old information auto-filled!");
    }
}

let taRowCount = 0;
function addTaRow() {
    // હવે 5 યાત્રા સુધીની મંજૂરી આપી છે
    if (taRowCount >= 5) { alert("⚠️ Maximum 5 journeys allowed."); return; }
    let today = new Date();
    let currentDate = String(today.getDate()).padStart(2, '0') + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + today.getFullYear();
    let tbody = document.getElementById('ta-input-body');
    let tr = document.createElement('tr');
    tr.id = `ta-row-${taRowCount}`;
    tr.innerHTML = `
        <td><input type="text" class="t-date" placeholder="Date" value="${currentDate}"></td>
        <td><input type="text" class="t-from" placeholder="From"></td>
        <td><input type="text" class="t-to" placeholder="To"></td>
        <td><input type="number" class="t-km" placeholder="KM"></td>
        <td><input type="text" class="t-mode" placeholder="Bus/Car"></td>
        <td><input type="text" class="t-class" placeholder="Class"></td>
        <td><input type="number" class="t-fare" placeholder="Fare" oninput="calcTotals()"></td>
        <td><input type="number" class="t-toll" placeholder="Toll" oninput="calcTotals()"></td>
        <td><input type="text" class="t-rem" placeholder="Remark"></td>
        <td><button type="button" class="btn-delete" onclick="deleteTaRow(${taRowCount})">X</button></td>
    `;
    tbody.appendChild(tr);
    taRowCount++;
}

function deleteTaRow(id) { document.getElementById(`ta-row-${id}`).remove(); taRowCount--; calcTotals(); }

function numberToWords(num) {
    if (num === 0) return "Zero";
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'Overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
}

function calcTotals() {
    let totalTa = 0;
    document.querySelectorAll('#ta-input-body tr').forEach(row => {
        let f = parseFloat(row.querySelector('.t-fare').value) || 0;
        let t = parseFloat(row.querySelector('.t-toll').value) || 0;
        totalTa += (f + t);
    });
    
    let dD = parseFloat(document.getElementById('i_da_days').value) || 0;
    let dR = parseFloat(document.getElementById('i_da_rate').value) || 0;
    let da = dD * dR;
    if(da > 0) document.getElementById('i_da_total').value = da.toFixed(2); else document.getElementById('i_da_total').value = '';

    let hD = parseFloat(document.getElementById('i_hon_days').value) || 0;
    let hR = parseFloat(document.getElementById('i_hon_rate').value) || 0;
    let hon = hD * hR;
    if(hon > 0) document.getElementById('i_hon_total').value = hon.toFixed(2); else document.getElementById('i_hon_total').value = '';

    let aD = parseFloat(document.getElementById('i_acc_days').value) || 0;
    let aR = parseFloat(document.getElementById('i_acc_rate').value) || 0;
    let acc = aD * aR;
    if(acc > 0) document.getElementById('i_acc_total').value = acc.toFixed(2); else document.getElementById('i_acc_total').value = '';

    let gross = totalTa + da + hon + acc;
    document.getElementById('display_gross').innerText = gross.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return { totalTa, gross, da, hon, acc };
}

function generateBill() {
    let btn = document.querySelector('.btn-generate');
    try {
        let { totalTa, gross, da, hon, acc } = calcTotals();
        let name = document.getElementById('i_name').value;
        if(!name) { alert("⚠️ Please enter Full Name!"); document.getElementById('i_name').focus(); return; }

        let originalBtnText = btn.innerText;
        btn.innerText = "⏳ Rendering PDF securely...";
        btn.style.opacity = "0.7";

        saveProfileData();

        document.getElementById('o_name').innerText = name;
        document.getElementById('o_sign_name').innerText = name;
        document.getElementById('o_sign_name_2').innerText = name;
        
        let dateVal = document.getElementById('i_date').value;
        let printDate = "";
        if(dateVal) {
            let dArr = dateVal.split('-');
            printDate = `${dArr[2]}-${dArr[1]}-${dArr[0]}`;
            document.getElementById('o_date').innerText = printDate;
        }

        document.getElementById('o_desig').innerText = document.getElementById('i_desig').value;
        document.getElementById('o_basic').innerText = document.getElementById('i_basic').value;
        document.getElementById('o_inst').innerText = document.getElementById('i_inst').value;
        document.getElementById('o_pan').innerText = document.getElementById('i_pan').value;
        document.getElementById('o_aadhar').innerText = document.getElementById('i_aadhar').value;
        document.getElementById('o_phone').innerText = document.getElementById('i_phone').value;
        document.getElementById('o_email').innerText = document.getElementById('i_email').value;
        document.getElementById('o_purpose').innerText = document.getElementById('i_purpose').value;
        document.getElementById('o_sem').innerText = document.getElementById('i_sem').value;
        document.getElementById('o_ref').innerText = document.getElementById('i_ref').value;

        // --- TA ROWS & TOLL LOGIC ---
        let tbody = document.getElementById('o_ta_body');
        if(tbody) {
            tbody.innerHTML = ''; 
            let totalRows = 0;

            let taRows = document.querySelectorAll('#ta-input-body tr');
            taRows.forEach((row) => {
                let date = row.querySelector('.t-date').value;
                let from = row.querySelector('.t-from').value;
                let to = row.querySelector('.t-to').value;
                let km = row.querySelector('.t-km').value;
                let mode = row.querySelector('.t-mode').value;
                let cls = row.querySelector('.t-class').value;
                let fare = parseFloat(row.querySelector('.t-fare').value) || 0;
                let toll = parseFloat(row.querySelector('.t-toll').value) || 0;
                let rem = row.querySelector('.t-rem').value;

                if(date || from || to || fare > 0 || toll > 0) {
                    let tr1 = document.createElement('tr');
                    tr1.className = 'h-row';
                    tr1.innerHTML = `<td class="text-center">${date}</td><td class="text-center">${from}</td><td class="text-center">${to}</td><td class="text-center">${km}</td><td class="text-center">${mode}</td><td class="text-center">${cls}</td><td class="text-center">${fare > 0 ? fare : ''}</td><td class="text-center" style="font-size: 7.5pt;">${rem}</td>`;
                    tbody.appendChild(tr1);
                    totalRows++;

                    if(toll > 0) {
                        let tr2 = document.createElement('tr');
                        tr2.className = 'h-row injected-toll-row';
                        tr2.innerHTML = `<td class="text-center">${date}</td><td class="text-center">-</td><td class="text-center">-</td><td class="text-center">-</td><td class="text-center">-</td><td class="text-center">-</td><td class="text-center">${toll}</td><td class="text-center" style="font-size: 7.5pt;">Toll Tax</td>`;
                        tbody.appendChild(tr2);
                        totalRows++;
                    }
                }
            });

            // if empty rows are less than 3, add empty rows to maintain table height
            while(totalRows < 3) {
                let tr = document.createElement('tr');
                tr.className = 'h-row';
                tr.innerHTML = `<td class="text-center"></td><td class="text-center"></td><td class="text-center"></td><td class="text-center"></td><td class="text-center"></td><td class="text-center"></td><td class="text-center"></td><td class="text-center"></td>`;
                tbody.appendChild(tr);
                totalRows++;
            }
        }

        document.getElementById('o_ta_total').innerText = totalTa > 0 ? totalTa : "";
        
        document.getElementById('o_da_days').innerText = document.getElementById('i_da_days').value;
        document.getElementById('o_da_rate').innerText = document.getElementById('i_da_rate').value;
        document.getElementById('o_da_total_d').innerText = da > 0 ? da : "";
        document.getElementById('o_da_total_2').innerText = da > 0 ? da : "";

        document.getElementById('o_hon_days').innerText = document.getElementById('i_hon_days').value;
        document.getElementById('o_hon_rate').innerText = document.getElementById('i_hon_rate').value;
        document.getElementById('o_hon_total_d').innerText = hon > 0 ? hon : "";
        document.getElementById('o_students').innerText = document.getElementById('i_students').value || "";
        document.getElementById('o_hon_total_2').innerText = hon > 0 ? hon : "";

        document.getElementById('o_acc_days').innerText = document.getElementById('i_acc_days').value;
        document.getElementById('o_acc_rate').innerText = document.getElementById('i_acc_rate').value;
        document.getElementById('o_acc_total_d').innerText = acc > 0 ? acc : "";
        document.getElementById('o_acc_total_2').innerText = acc > 0 ? acc : "";

        document.getElementById('o_gross_total').innerText = gross > 0 ? gross : "";
        document.getElementById('o_pass_rs').innerText = gross > 0 ? gross : "";
        document.getElementById('o_rec_rs').innerText = gross > 0 ? gross : "";
        
        let words = numberToWords(Math.floor(gross));
        document.getElementById('o_pass_words').innerText = words !== "Zero" ? words : "";
        document.getElementById('o_rec_words').innerText = words !== "Zero" ? words : "";

        document.getElementById('o_b_name').innerText = document.getElementById('i_b_name').value;
        document.getElementById('o_b_branch').innerText = document.getElementById('i_b_branch').value;
        document.getElementById('o_b_acc').innerText = document.getElementById('i_b_acc').value;
        document.getElementById('o_b_ifsc').innerText = document.getElementById('i_b_ifsc').value;
        document.getElementById('o_b_type').innerText = document.getElementById('i_b_type').value;

        let currentDept = localStorage.getItem('current_dept') || "Unknown";
        let history = JSON.parse(localStorage.getItem('gtu_bill_history')) || [];
        // History (DD-MM-YYYY) save with name, amount, dept
        history.push({ date: printDate, name: name, amount: gross, dept: currentDept });
        localStorage.setItem('gtu_bill_history', JSON.stringify(history));

        let element = document.getElementById('pdfWrapper');
        let sidebar = document.querySelector('.sidebar');
        let mainContent = document.querySelector('.main-content');
        
        sidebar.style.display = "none"; 
        mainContent.style.display = "none"; 
        document.body.style.overflow = "auto"; 
        document.body.style.height = "auto"; 
        document.getElementById('app-screen').style.overflow = "visible";
        document.getElementById('app-screen').style.height = "auto";
        
        element.style.display = "block"; 
        element.style.position = "relative"; 
        element.style.margin = "0 auto"; 

        window.scrollTo(0, 0); 

        setTimeout(() => {
            html2pdf().set({
                margin:       0,
                filename:     'GTU_Bill_' + name + '.pdf',
                image:        { type: 'jpeg', quality: 1.0 },
                html2canvas:  { scale: 2, useCORS: true, scrollY: 0 }, 
                jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' } 
            }).from(element).save().then(() => {
                element.style.display = "none"; 
                sidebar.style.display = "flex"; 
                mainContent.style.display = "block"; 
                document.body.style.overflow = "hidden";
                document.body.style.height = "100vh";
                document.getElementById('app-screen').style.overflow = "hidden";
                document.getElementById('app-screen').style.height = "100vh";
                
                btn.innerText = originalBtnText; 
                btn.style.opacity = "1";
                alert("✅ Perfectly Adjusted 1-Page Bill Generated!");
            }).catch(err => {
                element.style.display = "none"; 
                sidebar.style.display = "flex"; 
                mainContent.style.display = "block"; 
                document.body.style.overflow = "hidden";
                document.body.style.height = "100vh";
                document.getElementById('app-screen').style.overflow = "hidden";
                document.getElementById('app-screen').style.height = "100vh";
                
                btn.innerText = originalBtnText; 
                btn.style.opacity = "1";
                alert("⚠️ Error occurred while generating PDF: " + err.message);
            });
        }, 500); 

    } catch (error) {
        btn.innerText = "📥 Generate Exact Original PDF";
        btn.style.opacity = "1";
        alert("⚠️ mistake in filling information.\n\nError: " + error.message);
        console.error(error);
    }
}

// search function for history
function loadHistory() {
    let history = JSON.parse(localStorage.getItem('gtu_bill_history')) || [];
    let s = document.getElementById('searchInput').value.toLowerCase();
    let tb = document.getElementById('historyBody');
    tb.innerHTML = "";
    
    // name  date 
    history.filter(h => h.name.toLowerCase().includes(s) || (h.date && h.date.includes(s))).reverse().forEach(h => {
        tb.innerHTML += `<tr>
            <td>${h.date || '-'}</td>
            <td><b>${h.name}</b></td>
            <td style="color:#d97706; font-weight:bold;">₹${h.amount.toLocaleString('en-IN')}</td>
            <td><span class="dept-badge" style="margin:0;">${h.dept}</span></td>
        </tr>`;
    });
}