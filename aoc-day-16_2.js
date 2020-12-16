const fs = require('fs');

const input = fs.readFileSync('./input.txt', 'utf-8');

const [ rulesEncoded, myTicketEncoded, nearbyEncoded ] = input.split("\n\n");

const [ myTicket ] = myTicketEncoded.split("\n")
    .slice(1)
    .map((encoded) => {
        return encoded.split(",")
            .map((value) => 1 * value);
    });

const rules = rulesEncoded.split("\n")
    .map((encoded) => {
        const [ name, rangesEncoded ] = encoded.split(": ");
        const ranges = rangesEncoded.split(" or ")
            .map((rangesEncoded) => {
                const [ min, max ] = rangesEncoded.split("-");

                return {
                    min: 1 * min,
                    max: 1 * max,
                };
            });

        return {
            name,
            ranges,
        };
    });

const nearbyTickets = nearbyEncoded.split("\n")
    .slice(1)
    .map((nearbyTicketEncoded) => {
        return nearbyTicketEncoded
            .split(",")
            .map((value) => 1 * value);
    });

const validTickets = nearbyTickets
    .map((ticket) => {
        const result = {
            ticket,
            valid: true,
            validValues: [],
        };

        result.validValues = ticket.map((value) => {
            const validRules = rules.map((rule) => {
                const validRanges = rule.ranges.filter((range) => {
                    return range.min <= value && value <= range.max;
                });

                return { ...rule, validRanges };
            })
            .filter((rule) => rule.validRanges.length);

            return {
                value,
                valid: !!validRules.length,
                validRules,
            };
        })
            .filter((value) => value.valid);

        result.valid = result.validValues.length === ticket.length;

        return result;
    })
    .filter((ticket) => {
        return ticket.valid;
    });
    
const histogram = {};
validTickets.forEach((validTicket) => {
    validTicket.validValues.forEach((validValue, index) => {
        const valueKey = `${index}`;
        validValue.validRules.forEach((validRule) => {
            if (!(valueKey in histogram)) {
                histogram[valueKey] = {};
            }

            const ruleKey = validRule.name;
            if (!(ruleKey in histogram[valueKey])) {
                histogram[valueKey][ruleKey] = 0;
            }

            histogram[valueKey][ruleKey]++;
        });
    });
});

const fieldCandidates = {};
Object.entries(histogram).forEach(([valueKey, valueHisto]) => {
    const candidates = Object.entries(valueHisto)
        .filter(([, count]) => {
            return count === validTickets.length;
        })
        .map(([ruleName]) => ruleName);

    fieldCandidates[valueKey] = candidates;
});

const fields = {};
console.log(fieldCandidates);
const keyMap = {...fieldCandidates};
let keyEntries = Object.entries(keyMap);
while(keyEntries.length) {
    const [[valueKey, [field]]] = keyEntries.filter(([, candidates]) => candidates.length === 1);

    fields[valueKey] = field;
    delete keyMap[valueKey];

    Object.keys(keyMap).forEach((key) => {
        keyMap[key] = keyMap[key].filter((candidate) => candidate !== field);
    });

    keyEntries = Object.entries(keyMap);
}

const product = Object.entries(fields)
    .filter(([, field]) => {
        return field.startsWith('departure');
    })
    .reduce((prod, [valueKey]) => {
        return prod * myTicket[1 * valueKey];
    }, 1);

console.log(product);