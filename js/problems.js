const ProblemSet = (function () {

    let nextAnimalId = 1;
    let nextGroupId = 1;

    function createAnimal({ species, size, color, pattern = 'solid' }) {
        const normalizedSpecies = species.toLowerCase();
        const normalizedSize = size.toLowerCase();
        const normalizedColor = color.toLowerCase();
        const normalizedPattern = pattern === 'striped' ? 'striped' : 'solid';

        const sizeFolder = Config.animals.sizeFolderMap[normalizedSize]?.[normalizedPattern];
        const image = sizeFolder
            ? `${Config.images.animalsBase}/${normalizedSpecies}/${sizeFolder}/${normalizedColor}.svg`
            : '';

        return {
            id: nextAnimalId++,
            species: normalizedSpecies,
            size: normalizedSize,
            color: normalizedColor,
            pattern: normalizedPattern,
            image
        };
    }

    const a = (species, size, color, pattern = 'solid') =>
        createAnimal({ species, size, color, pattern });

    function makeChoice(animals) {
        const group = Array.isArray(animals) ? animals : [animals];
        const id = group.length === 1 ? group[0].id : `group-${nextGroupId++}`;
        return { id, animals: group };
    }

    function buildProblemSet() {
        nextAnimalId = 1;
        nextGroupId = 1;

        return [

            // Anomaly Sample
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'small', 'yellow')),
                    makeChoice(a('pig', 'medium', 'yellow')),
                    makeChoice(a('dog', 'large', 'yellow')),
                    makeChoice(a('cat', 'small', 'yellow', 'striped'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Sample',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[3].id
                };
            })(),

            // Anomaly Question 1
            (() => {
                const choices = [
                    makeChoice(a('cat', 'small', 'red')),
                    makeChoice(a('pig', 'small', 'red', 'striped')),
                    makeChoice(a('sheep', 'small', 'green', 'striped')),
                    makeChoice(a('cow', 'small', 'red'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 1',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Anomaly Question 2
            (() => {
                const choices = [
                    makeChoice(a('dog', 'small', 'green', 'striped')),
                    makeChoice(a('cow', 'small', 'green', 'striped')),
                    makeChoice(a('pig', 'large', 'green', 'striped')),
                    makeChoice(a('dog', 'large', 'green')),
                    makeChoice(a('cow', 'large', 'green'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 2',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Anomaly Question 3
            (() => {
                const choices = [
                    makeChoice(a('pig', 'large', 'blue')),
                    makeChoice(a('cow', 'large', 'blue')),
                    makeChoice(a('cat', 'medium', 'green', 'striped')),
                    makeChoice(a('dog', 'medium', 'green', 'striped')),
                    makeChoice(a('dog', 'medium', 'green'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 3',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[4].id
                };
            })(),

            // Anomaly Question 4
            (() => {
                const choices = [
                    makeChoice(a('cat', 'small', 'red', 'striped')),
                    makeChoice(a('cat', 'large', 'green', 'striped')),
                    makeChoice(a('cat', 'large', 'blue')),
                    makeChoice(a('cat', 'small', 'blue', 'striped')),
                    makeChoice(a('cat', 'large', 'red', 'striped'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 4',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Anomaly Question 5
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'small', 'yellow', 'striped')),
                    makeChoice(a('sheep', 'large', 'green', 'striped')),
                    makeChoice(a('sheep', 'small', 'blue')),
                    makeChoice(a('sheep', 'large', 'yellow', 'striped')),
                    makeChoice(a('sheep', 'large', 'blue', 'striped'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 5',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Anomaly Question 6
            (() => {
                const choices = [
                    makeChoice(a('dog', 'large', 'red')),
                    makeChoice(a('horse', 'large', 'red')),
                    makeChoice(a('dog', 'large', 'red', 'striped')),
                    makeChoice(a('horse', 'small', 'red')),
                    makeChoice(a('dog', 'small', 'red', 'striped'))
                ];
                return {
                    type: 'Anomaly',
                    label: 'Question 6',
                    sections: [{ label: 'Animals', selectable: true, items: choices }],
                    correctChoiceId: choices[0].id
                };
            })(),

            // Analogy Sample
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'medium', 'yellow')),
                    makeChoice(a('sheep', 'large', 'green')),
                    makeChoice(a('sheep', 'small', 'yellow')),
                    makeChoice(a('pig', 'medium', 'green'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Sample',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('pig', 'large', 'green')] },
                                { animals: [a('pig', 'small', 'green')] },
                                { animals: [a('sheep', 'large', 'yellow')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Analogy Question 1
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'medium', 'green')),
                    makeChoice(a('sheep', 'medium', 'blue', 'striped')),
                    makeChoice(a('pig', 'medium', 'blue', 'striped')),
                    makeChoice(a('pig', 'small', 'green'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 1',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('pig', 'large', 'green')] },
                                { animals: [a('pig', 'medium', 'green')] },
                                { animals: [a('pig', 'large', 'blue', 'striped')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Analogy Question 2
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'small', 'blue')),
                    makeChoice(a('sheep', 'medium', 'yellow')),
                    makeChoice(a('cow', 'large', 'blue')),
                    makeChoice(a('sheep', 'small', 'yellow'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 2',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('cat', 'large', 'yellow')] },
                                { animals: [a('cat', 'medium', 'yellow')] },
                                { animals: [a('sheep', 'large', 'yellow')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Analogy Question 3
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'small', 'blue')),
                    makeChoice(a('cow', 'small', 'green')),
                    makeChoice(a('dog', 'large', 'blue')),
                    makeChoice(a('cow', 'small', 'yellow'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 3',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('sheep', 'large', 'green')] },
                                { animals: [a('cow', 'large', 'yellow')] },
                                { animals: [a('sheep', 'small', 'green')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[3].id
                };
            })(),

            // Analogy Question 4
            (() => {
                const choices = [
                    makeChoice(a('cat', 'small', 'blue')),
                    makeChoice(a('sheep', 'small', 'red')),
                    makeChoice(a('sheep', 'small', 'blue')),
                    makeChoice(a('sheep', 'small', 'blue', 'striped'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 4',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('cat', 'large', 'red')] },
                                { animals: [a('sheep', 'large', 'blue')] },
                                { animals: [a('cat', 'small', 'red')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Analogy Question 5
            (() => {
                const choices = [
                    makeChoice(a('cow', 'large', 'blue')),
                    makeChoice(a('sheep', 'medium', 'yellow')),
                    makeChoice(a('dog', 'small', 'blue')),
                    makeChoice(a('dog', 'large', 'yellow'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 5',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('sheep', 'large', 'red')] },
                                { animals: [a('cat', 'large', 'green')] },
                                { animals: [a('cow', 'large', 'red')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[3].id
                };
            })(),

            // Analogy Question 6
            (() => {
                const choices = [
                    makeChoice(a('dog', 'small', 'green')),
                    makeChoice(a('dog', 'small', 'yellow')),
                    makeChoice(a('cat', 'medium', 'blue')),
                    makeChoice(a('sheep', 'large', 'red'))
                ];
                return {
                    type: 'Analogy',
                    label: 'Question 6',
                    sections: [
                        {
                            label: 'Question Box', selectable: false, items: [
                                { animals: [a('dog', 'large', 'blue')] },
                                { animals: [a('sheep', 'small', 'red')] },
                                { animals: [a('pig', 'large', 'yellow')] }
                            ]
                        },
                        { label: 'Answer Choices', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[0].id
                };
            })(),

            // Antithesis Sample
            (() => {
                const choices = [
                    makeChoice(a('cat', 'medium', 'green')),
                    makeChoice(a('pig', 'medium', 'red')),
                    makeChoice(a('cow', 'medium', 'green')),
                    makeChoice(a('dog', 'medium', 'green'))
                ];
                return {
                    type: 'Antithesis',
                    label: 'Sample',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('dog', 'small', 'green')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('dog', 'large', 'green')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[3].id
                };
            })(),

            // Antithesis Question 1
            (() => {
                const choices = [
                    makeChoice(a('cat', 'large', 'blue')),
                    makeChoice(a('cat', 'medium', 'green')),
                    makeChoice(a('dog', 'medium', 'red')),
                    makeChoice(a('cat', 'small', 'yellow')),
                    makeChoice(a('sheep', 'medium', 'green'))
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 1',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('cat', 'large', 'yellow')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('cat', 'small', 'blue')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antithesis Question 2
            (() => {
                const choices = [
                    makeChoice([a('cow', 'medium', 'yellow'), a('dog', 'medium', 'green')]),
                    makeChoice([a('pig', 'medium', 'green'), a('cow', 'medium', 'yellow')]),
                    makeChoice([a('dog', 'medium', 'yellow'), a('sheep', 'small', 'blue')]),
                    makeChoice([a('sheep', 'medium', 'yellow'), a('dog', 'medium', 'green')])
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 2',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('cow', 'large', 'yellow'), a('dog', 'large', 'green')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('cow', 'small', 'yellow'), a('dog', 'small', 'green')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[0].id
                };
            })(),

            // Antithesis Question 3
            (() => {
                const choices = [
                    makeChoice([a('sheep', 'medium', 'red'), a('cow', 'medium', 'red')]),
                    makeChoice([a('pig', 'large', 'green'), a('pig', 'large', 'red')]),
                    makeChoice([a('cow', 'medium', 'green'), a('sheep', 'medium', 'green')]),
                    makeChoice(a('sheep', 'medium', 'green'))
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 3',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('cow', 'small', 'green')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('cow', 'large', 'green'), a('sheep', 'large', 'green'), a('pig', 'large', 'green')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Antithesis Question 4
            (() => {
                const choices = [
                    makeChoice(a('dog', 'small', 'blue')),
                    makeChoice([a('cat', 'small', 'yellow'), a('pig', 'small', 'yellow')]),
                    makeChoice([a('sheep', 'medium', 'green'), a('dog', 'medium', 'green')]),
                    makeChoice(a('cow', 'large', 'yellow'))
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 4',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('sheep', 'small', 'red')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('cow', 'large', 'blue'), a('sheep', 'large', 'blue'), a('dog', 'large', 'blue')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Antithesis Question 5
            (() => {
                const choices = [
                    makeChoice([a('dog', 'small', 'blue'), a('sheep', 'small', 'blue')]),
                    makeChoice(a('dog', 'large', 'red')),
                    makeChoice([a('dog', 'small', 'red'), a('dog', 'medium', 'yellow')]),
                    makeChoice([a('dog', 'small', 'red'), a('dog', 'small', 'yellow'), a('sheep', 'medium', 'blue')])
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 5',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('dog', 'small', 'yellow')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('dog', 'small', 'blue'), a('dog', 'medium', 'red'), a('dog', 'large', 'yellow')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[2].id
                };
            })(),

            // Antithesis Question 6
            (() => {
                const choices = [
                    makeChoice([a('horse', 'medium', 'red'), a('cat', 'medium', 'blue')]),
                    makeChoice([a('cow', 'medium', 'red'), a('dog', 'medium', 'red')]),
                    makeChoice(a('cat', 'medium', 'red')),
                    makeChoice([a('dog', 'medium', 'blue'), a('pig', 'medium', 'blue'), a('cow', 'medium', 'blue')])
                ];
                return {
                    type: 'Antithesis',
                    label: 'Question 6',
                    sections: [
                        { label: 'Box 1', selectable: false, items: [{ animals: [a('horse', 'medium', 'red')] }] },
                        { label: 'Box 3', selectable: false, items: [{ animals: [a('cat', 'medium', 'red'), a('sheep', 'medium', 'red'), a('pig', 'medium', 'red')] }] },
                        { label: 'Options Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antinomy Sample
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'large', 'blue')),
                    makeChoice(a('sheep', 'medium', 'green')),
                    makeChoice(a('sheep', 'small', 'green')),
                    makeChoice(a('dog', 'small', 'red'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Sample',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('cat', 'medium', 'green'), a('cow', 'medium', 'green'), a('pig', 'medium', 'green')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('cat', 'large', 'yellow'), a('cow', 'large', 'yellow'), a('pig', 'large', 'yellow')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antinomy Question 1
            (() => {
                const choices = [
                    makeChoice(a('pig', 'large', 'red')),
                    makeChoice(a('pig', 'large', 'blue')),
                    makeChoice(a('sheep', 'medium', 'blue')),
                    makeChoice(a('cat', 'medium', 'yellow'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 1',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('sheep', 'large', 'blue'), a('cat', 'large', 'blue'), a('cow', 'large', 'blue')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('sheep', 'large', 'yellow'), a('dog', 'large', 'yellow'), a('cow', 'large', 'yellow')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antinomy Question 2
            (() => {
                const choices = [
                    makeChoice(a('cow', 'large', 'blue', 'striped')),
                    makeChoice(a('pig', 'large', 'red', 'striped')),
                    makeChoice(a('sheep', 'large', 'red')),
                    makeChoice(a('pig', 'medium', 'green'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 2',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('cow', 'large', 'red', 'striped'), a('cat', 'large', 'red', 'striped'), a('sheep', 'large', 'red', 'striped')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('cow', 'large', 'red'), a('cat', 'large', 'red'), a('sheep', 'large', 'red')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antinomy Question 3
            (() => {
                const choices = [
                    makeChoice(a('dog', 'small', 'green', 'striped')),
                    makeChoice(a('dog', 'large', 'green')),
                    makeChoice(a('dog', 'medium', 'red')),
                    makeChoice(a('dog', 'small', 'green'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 3',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('dog', 'small', 'blue'), a('dog', 'small', 'yellow'), a('dog', 'small', 'red')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('dog', 'large', 'blue'), a('dog', 'large', 'red'), a('dog', 'large', 'yellow')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[0].id
                };
            })(),

            // Antinomy Question 4
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'medium', 'blue')),
                    makeChoice(a('pig', 'medium', 'red', 'striped')),
                    makeChoice(a('cow', 'small', 'yellow')),
                    makeChoice(a('sheep', 'medium', 'green')),
                    makeChoice(a('dog', 'large', 'green', 'striped'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 4',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('cat', 'medium', 'blue', 'striped'), a('sheep', 'medium', 'yellow', 'striped'), a('horse', 'medium', 'green', 'striped')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('pig', 'large', 'blue'), a('dog', 'large', 'red'), a('horse', 'large', 'yellow')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[1].id
                };
            })(),

            // Antinomy Question 5
            (() => {
                const choices = [
                    makeChoice(a('sheep', 'small', 'red')),
                    makeChoice(a('cow', 'large', 'green')),
                    makeChoice(a('sheep', 'small', 'yellow')),
                    makeChoice(a('sheep', 'medium', 'red'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 5',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('cat', 'small', 'green'), a('sheep', 'small', 'blue'), a('pig', 'small', 'yellow')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('cow', 'medium', 'red'), a('cat', 'medium', 'blue'), a('sheep', 'medium', 'yellow')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[0].id
                };
            })(),

            // Antinomy Question 6
            (() => {
                const choices = [
                    makeChoice(a('cow', 'small', 'green', 'striped')),
                    makeChoice(a('sheep', 'small', 'blue')),
                    makeChoice(a('horse', 'small', 'yellow')),
                    makeChoice(a('horse', 'small', 'yellow', 'striped'))
                ];
                return {
                    type: 'Antinomy',
                    label: 'Question 6',
                    sections: [
                        { label: 'Green Box', selectable: false, items: [{ animals: [a('sheep', 'small', 'green', 'striped'), a('cow', 'small', 'blue', 'striped'), a('cat', 'small', 'red', 'striped')] }] },
                        { label: 'Red Box', selectable: false, items: [{ animals: [a('sheep', 'small', 'green'), a('cow', 'small', 'blue'), a('cat', 'small', 'red')] }] },
                        { label: 'Choices Box', selectable: true, items: choices }
                    ],
                    correctChoiceId: choices[3].id
                };
            })(),

        ];
    }

    return {
        getProblems() {
            return buildProblemSet();
        },

        getProblemsByType(type) {
            return buildProblemSet().filter(p =>
                p.type.toLowerCase() === type.toLowerCase()
            );
        },

        getInstruction(type) {
            const typeConfig = Config.gameTypes[type.toLowerCase()];
            return typeConfig ? typeConfig.instruction : 'Choose the best answer.';
        },

        formatAnimalLabel(animal) {
            const patternText = animal.pattern === 'striped' ? 'striped ' : '';
            return `${animal.size} ${patternText}${animal.color} ${animal.species}`;
        },

        collectProblemAnimals(problemData) {
            const animals = [];
            problemData.sections.forEach(section => {
                section.items.forEach(item => {
                    const itemAnimals = item.animals || item;
                    if (Array.isArray(itemAnimals)) {
                        itemAnimals.forEach(animal => animals.push(animal));
                    }
                });
            });
            return animals;
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProblemSet;
}
