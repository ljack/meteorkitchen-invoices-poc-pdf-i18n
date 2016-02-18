lasku_2 = function(data) {

	// see https://github.com/lindell/JsBarcode

	// console.log("printPdf...", data);
	// Define the pdf-document 


	// console.log("virtualbarcode=", virtualbarcode);

	let invoice_details = data.invoice_details;

	let date = formatDate(invoice_details.date);
	let dueDate = formatDate(invoice_details.dueDate);

	let ourReference = invoice_details.ourReference || " ";
	let yourReference = invoice_details.yourReference || " ";
	let invoiceNumber = invoice_details.invoiceNumber || " ";
	let deliveryRange = invoice_details.deliveryRange || " ";
	let paymentTerm = invoice_details.paymentTerm || " ";

	let comp = data.invoice_details.company;

	let companyName = comp.name || " ";
	let companyAddress1 = comp.streetAddress || " ";
	let companyAddress2 = comp.streetAddress2 || " ";
	let companyAddress3 = comp.zipCode || " ";
	let companyAddress4 = comp.city || " ";
	let companyPhone = comp.phoneNumber || " ";
	let companyIBAN = comp.IBAN || " ";
	let companySWIFT = comp.SWIFT || " ";
	let companyVATCode = comp.vatCode || " ";
	let companyHomeplace = comp.homeplace || " ";
	let companyEmail = comp.email || " ";

	let customer = data.invoice_details.customer;
	// customer = Customers.findOne( {_id: customer.id });

	let customerNumber = customer.customerNumber || "";

	let customerName = customer.name || "";
	let customerAdress1 = customer.streetAddress || "";
	let customerAdress2 = customer.name2 || "";
	let customerAdress3 = customer.zipCode || "";
	let customerAdress4 = customer.city || "";

	let note = "Note" || "";
	let paymentReferenceNumber = "1123123125";



	let line = {
		table: {
			headerRows: 1,
			widths: ['100%'],
			body: [
				[''],
				['']
			]
		},
		layout: 'headerLineOnly'
	};

	let invoice_items = [];

	let header = [{
		bold: true,
		text: t("Tuote")
	}, {
		bold: true,
		text: t("Tuotenimi")
	}, {
		bold: true,
		text: t("Määrä Yks.")
	}, {
		bold: true,
		text: t("A hinta\n(veroton)")
	}, {
		bold: true,
		text: t("Alv %")
	}, {
		bold: true,
		text: t("Yhteensä")
	}];



	invoice_items.push(header);

	// calclate VAT summaries 
	let totalAmount = 0.0;
	let vatSummary = {};

	data.invoice_items.forEach(function(obj) {
		let item = obj;
		let row = [];

		row.push("" + (item.itemCode || " "))

		row.push({
			text: "" + item.description
		});

		row.push("" + item.quantity);
		row.push("" + formatEur(item.price));

		row.push("" + item.vat);
		let rowSum = (item.quantity * item.price);

		vatSummary[item.vat] = vatSummary[item.vat] ? vatSummary[item.vat] + rowSum : rowSum;

		totalAmount += rowSum;
		row.push("" + formatEur(rowSum));
		invoice_items.push(row);
	});

	console.log(invoice_items);

	let vatSummaryOut = [
		["Alv%", "Peruste", "Veroa", "Yhteensä"]
	];

	let vatTotal = 0;
	let totalAmountWithoutVat = 0;

	for (let vat in vatSummary) {

		let brutto = vatSummary[vat];
		let vatFactor = (parseFloat(vat) + 100) / 100;
		let taxAmount = brutto - (brutto / vatFactor);
		let netto = brutto - taxAmount;
		let vatRow = [];
		// console.log( "alv="+vat+" netto="+netto+" vero="+taxAmount+" brutto="+brutto);
		vatRow.push("" + vat);
		vatRow.push("" + formatEur(netto));
		vatRow.push("" + formatEur(taxAmount));
		vatRow.push("" + formatEur(brutto));

		vatTotal += taxAmount;

		vatSummaryOut.push(vatRow);
	}
	totalAmountWithoutVat = totalAmount - vatTotal;

	// invoice rows summary
	let vatTotalLine = [{
		bold: true,
		text: t("Alv yhteensä")
	}, {
		bold: true,
		text: t("EUR")
	}, {
		bold: true,
		text: "" + formatEur(vatTotal)
	}, " "];

	vatSummaryOut.push(vatTotalLine);


	// console.log(invoice_items.slice(0));
	// calculate reference numbers

	if ($("#barcode").length == 0) {
		$(".printPdf").after("<img id='barcode' ></img>");
		$("#barcode").hide();
	}

	/* virtual barcode
	 * 1 Barcode version, this is version 4 or 5, 4 local finnish, 5 RE international version
	 * 1 Currency (1=FIM, 2=EURO)
	 * 16 IBAN without leading country code
	 * 6 Euros
	 * 2 Cents
	 * 3 Spares, contain zeros
	 * 20 Reference Number
	 * 6 Due Date. Format is YYMMDD.
	 */
	// console.log(totalAmount);
	// remove first two characters and any spaces
	let tempIBAN = companyIBAN.slice(2).replace(/ /g, "");
	// totalAmount is float here
	// 970.08
	let tempSum = sprintf("%09.2f", totalAmount);
	tempSum = tempSum.split(".");
	let euros = tempSum[0];
	let sents = tempSum[1];
	// console.log("euros="+euros+" sents="+sents);
	let tempRef = sprintf("%020d", paymentReferenceNumber);
	let tempDueDate = moment(invoice_details.dueDate).format("YYMMDD");

	let virtualBarcode = "4" + tempIBAN + euros + sents + "000" + tempRef + tempDueDate;

	// var barcode = JsBarcode("#barcode","JsBarcode is easy!",{width:1,height:25});
	let barcode = $("#barcode").JsBarcode(virtualBarcode, {
		height: 30,
		width: 1,
		format: "CODE128C",
		displayValue: true,
		fontSize: 10
	});

	// console.log("barcode=", barcode);
	let virtualbarcode = barcode[0].currentSrc;

	let penaltyInterest = "13 %";
	let currency = "EUR";

	var docDefinition = {
		pageSize: 'A4',
		pageMargins: [50, 25, 50, 25],

		// Content with styles 
		content: [{
				columns: [{
					width: "50%",
					text: companyName,
					style: 'headline'
				}, {
					text: t("Lasku"),
					fontSize: 18,
					bold: true
				}]
			}, {
				columns: [{
					width: '50%',
					style: ['listItem'],
					stack: [
						companyName,
						companyAddress1,
						companyAddress2,
						companyAddress3 + " " + companyAddress4,
						"\n",
						customerName,
						customerAdress1,
						customerAdress2,
						customerAdress3 + " " + customerAdress4
					]
				}, {
					width: '20%',
					alignment: "right",
					stack: [t("Päivämäärä"), "\n", t("Laskunumero"), "\n", t("Asiakastunnus"), t("Maksuehto"), t("Viivästyskorko"), t("Valuutta")],
					style: ['listItem']

				}, {
					width: '*',
					bold: true,
					fontSize: 10,
					stack: ["" + date, "\n", invoiceNumber, "\n", customerNumber, paymentTerm, penaltyInterest, currency]
				}],
				columnGap: 10
			}, {
				text: "\n\n\n\n\n"
			}, {
				text: note,
				style: ['listItem']
			}, {
				text: "\n"
			}, { // invoice_items rows
				table: {
					headerRows: 1,
					widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
					style: ['listItem'],
					body: invoice_items


				},
				layout: 'lightHorizontalLines',
				style: ['listItem']
			}, {
				text: "\n\n"
			}, {
				widths: ["70%", "auto"],

				alignment: "right",
				columns: [{
					width: "*",
					style: ['listItem'],
					table: {
						width: "100%",
						headerRows: 1,
						widths: ['auto', 'auto', 'auto', 'auto'],
						alignment: 'right',
						body: vatSummaryOut
					},
					layout: 'noBorders',
				}, {
					width: "*",
					columns: [{
						width: "70%",
						stack: [t("Yhteensä"), t("VAT"), {
							bold: true,
							text: t("Maksettava yhteensä EUR")
						}]
					}, {
						width: "*",
						stack: [formatEur(totalAmountWithoutVat), formatEur(vatTotal), formatEur(totalAmount)]
					}],
					style: ['listItem']
				}]
			}, "\n\n\n", {
				margin: [0, 0, 0, 0],
				bold: true,
				columns: [{
					stack: [t("Pankki"), "Nordea"]
				}, {
					stack: [t("IBAN"), companyIBAN]
				}, {
					stack: [t("BIC"), companySWIFT]
				}],
				columnGap: 10
			}, "\n\n\n", {
				columns: [t("Eräpäivä"), currency, totalAmount, t("Viitenumero"), paymentReferenceNumber]
			},
			"\n\n\n", {
				image: virtualbarcode,
				text: virtualBarcode,
				alignment: "center"
			}

		],

		// Style dictionary 
		styles: {
			headline: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 25]
			},
			listItem: {
				fontSize: 10,
				margin: [0, 0, 0, 5]
			},
			listLabel: {
				fontSize: 12,
				bold: true
			},
			listText: {
				fontSize: 10,
				italic: true
			},
			footer: {
				fontSize: 8
			}
		}
	};


	// Start the pdf-generation process 
	pdfMake.createPdf(docDefinition).open();
}
