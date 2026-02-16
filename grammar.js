/**
 * @file Parser for the Nyx programming language
 * @author Luca Mezzavilla <lucamezza4@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "nyx",

  word: $ => $.identifier,

  externals: $ => [$.newline, $.indent, $.dedent, $.whitespace],

  extras: $ => [/[ \t]/, $.comment],

  conflicts: $ => [
    [$.path_segment],
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.pass_statement,
      $.function_definition,
      $.function_declaration,
      $.let_statement,
      $.mut_statement,
      $.const_statement,
      $.type_statement,
      $.enum_definition,
      $.union_definition,
      $.struct_definition,
      $.interface_definition,
      $.namespace_definition,
      $.impl_block,
      $.expression_statement,
      $.comment,
    ),

    comment: $ => token(seq("//", /.*/)),

    pass_statement: $ => seq("pass", $.newline),

    expression_statement: $ => seq($.expression, $.newline),

    namespace_definition: $ => seq(
      "namespace",
      $.path,
      $.newline,
      $.indent,
      repeat1($._statement),
      $.dedent
    ),

    impl_block: $ => seq(
      "impl",
      optional($.generic_parameters),
      ":",
      $.type_annotation,
      $.newline,
      $.indent,
      optional($.where_clause),
      optional($.whitespace),
      choice($.function_definition, $.function_declaration),
      repeat(seq(
        $.whitespace,
        choice($.function_definition, $.function_declaration)
      )),
      $.dedent
    ),

    function_definition: $ => seq(
      $.function_signature,
      $.newline,
      $.indent,
      optional($.where_clause),
      optional($.whitespace),
      $._statement,
      repeat(seq(
        $.whitespace,
        $._statement
      )),
      $.dedent
    ),

    function_declaration: $ => seq(
      $.function_signature,
      $.newline
    ),

    function_signature: $ => seq(
      optional("extern"),
      "fn",
      optional("!"),
      $.path,
      "(",
      optional($.parameters),
      ")",
      optional(seq("->", $.type_annotation))
    ),

    // Unified path rule that handles all path types:
    // - Simple: identifier
    // - Namespaced: std::identifier, core::io::print
    // - With generics: Vec[T], std::Vec[T]
    path: $ => seq(
      $.path_segment,
      repeat(seq("::", $.path_segment))
    ),

    path_segment: $ => seq(
      choice($.identifier, $.builtin_namespace),
      optional($.generic_arguments)
    ),

    builtin_namespace: $ => choice("std", "core", "alloc"),

    let_statement: $ => seq(
      "let",
      $.identifier,
      optional(seq(":", $.type_annotation)),
      "=",
      $.expression,
      $.newline
    ),

    mut_statement: $ => seq(
      "mut",
      $.identifier,
      optional(seq(":", $.type_annotation)),
      "=",
      $.expression,
      $.newline
    ),

    const_statement: $ => seq(
      "const",
      $.identifier,
      optional(seq(":", $.type_annotation)),
      "=",
      $.expression,
      $.newline
    ),

    type_statement: $ => seq(
      "type",
      $.path,
      optional($.generic_parameters),
      "=",
      $.type_annotation,
      $.newline
    ),

    enum_definition: $ => seq(
      "enum",
      optional(seq("[", $.type_annotation, "]")),
      $.path,
      $.newline,
      $.indent,
      optional($.requires_clause),
      optional($.whitespace),
      $.enum_variant,
      repeat(seq($.whitespace, $.enum_variant)),
      $.dedent
    ),

    enum_variant: $ => seq(
      $.identifier,
      optional(seq("=", $.expression)),
      $.newline
    ),

    union_definition: $ => seq(
      "union",
      $.path,
      optional($.generic_parameters),
      $.newline,
      $.indent,
      optional($.requires_clause),
      optional($.where_clause),
      optional($.whitespace),
      $.union_variant,
      repeat(seq($.whitespace, $.union_variant)),
      $.dedent
    ),

    union_variant: $ => seq(
      $.identifier,
      ":",
      $.type_annotation,
      $.newline
    ),

    struct_definition: $ => seq(
      optional("packed"),
      "struct",
      $.path,
      optional($.generic_parameters),
      $.newline,
      $.indent,
      optional($.requires_clause),
      optional($.where_clause),
      optional($.whitespace),
      $.struct_field,
      repeat(seq($.whitespace, $.struct_field)),
      $.dedent
    ),

    struct_field: $ => seq(
      $.identifier,
      ":",
      $.type_annotation,
      $.newline
    ),

    interface_definition: $ => seq(
      "interface",
      $.path,
      optional($.generic_parameters),
      $.newline,
      $.indent,
      optional($.extends_clause),
      optional($.where_clause),
      optional($.whitespace),
      $.function_declaration,
      repeat(seq($.whitespace, $.function_declaration)),
      $.dedent
    ),

    where_clause: $ => seq(
      "where",
      $.newline,
      $.indent,
      repeat1($.constraint),
      $.dedent
    ),
    constraint: $ => choice($.type_constraint),
    type_constraint: $ => seq(
      $.identifier,
      ":",
      $.bound,
      $.newline
    ),
    bound: $ => sep1($.path, "+"),

    requires_clause: $ => seq(
      "requires",
      $.newline,
      $.indent,
      repeat1($.requirement),
      $.dedent
    ),
    requirement: $ => seq($.path, $.newline),

    extends_clause: $ => seq(
      "extends",
      $.newline,
      $.indent,
      repeat1($.extension),
      $.dedent
    ),
    extension: $ => seq($.path, $.newline),

    parameters: $ => sep1($.parameter, ","),

    parameter: $ => seq($.identifier, ":", $.type_annotation),

    type_annotation: $ => choice(
      $.type_ptr,
      $.base_type,
    ),

    base_type: $ => prec(1, seq(
      // Optional prefix array/slice operators
      repeat(choice(
        seq("[", $.expression, "]"),  // array: T[20]
        seq("[", "]")                   // slice: T[]
      )),
      choice(
        $.type_u8,
        $.type_u16,
        $.type_u32,
        $.type_u64,
        $.type_i8,
        $.type_i16,
        $.type_i32,
        $.type_i64,
        $.type_f32,
        $.type_f64,
        $.type_bool,
        $.path,
      ),
    )),

    type_ptr: $ => seq(
      optional("?"),
      "*",
      optional("mut"),
      $.type_annotation
    ),

    generic_arguments: $ => seq('[', sep1($.type_annotation, ","), ']'),

    generic_parameters: $ => seq('[', sep1($.identifier, ","), ']'),

    type_u8: $ => "u8",
    type_u16: $ => "u16",
    type_u32: $ => "u32",
    type_u64: $ => "u64",
    type_i8: $ => "i8",
    type_i16: $ => "i16",
    type_i32: $ => "i32",
    type_i64: $ => "i64",
    type_f32: $ => "f32",
    type_f64: $ => "f64",
    type_bool: $ => "bool",

    expression: $ => choice(
      $.postfix_expression,
      $.unary_expression,
      $.binary_expression
    ),

    primary_expression: $ => choice(
      "self",
      $.identifier,
      $.number,
      $.boolean,
      $.string,
      $.interpolated_string,
      $.parenthesized_expression
    ),

    postfix_expression: $ => prec.left(12, seq(
      $.primary_expression,
      repeat(choice(
        seq(".", optional("!"), $.identifier, optional($.generic_arguments)),      // member access
        seq("::", $.identifier, optional($.generic_arguments)),     // namespace/type access
        seq(optional("!"), "(", optional($.arguments), ")"), // function call
        seq("[", $.expression, "]"), // array indexing
      ))
    )),

    call_expression: $ => seq(
      $.identifier,
      "(",
      optional($.arguments),
      ")"
    ),

    parenthesized_expression: $ => seq(
      "(",
      $.expression,
      ")"
    ),

    unary_expression: $ => prec(11, seq(
      choice("&", "*", "-", "+", "~", "!"),
      $.expression
    )),

    binary_expression: $ => choice(
      // Level 1: Multiplication, Division, Modulo
      prec.left(10, seq($.expression, choice("*", "/", "%"), $.expression)),

      // Level 2: Addition and Subtraction
      prec.left(9, seq($.expression, choice("+", "-"), $.expression)),

      // Level 3: Bit shifts
      prec.left(8, seq($.expression, choice("<<", ">>"), $.expression)),

      // Level 4: Comparison operators
      prec.left(7, seq($.expression, choice("<", ">", "<=", ">="), $.expression)),

      // Level 5: Equality operators
      prec.left(6, seq($.expression, choice("==", "!="), $.expression)),

      // Level 6: Bitwise AND
      prec.left(5, seq($.expression, "&", $.expression)),

      // Level 7: Bitwise XOR
      prec.left(4, seq($.expression, "^", $.expression)),

      // Level 8: Bitwise OR
      prec.left(3, seq($.expression, "|", $.expression)),

      // Level 9: Logical AND
      prec.left(2, seq($.expression, "&&", $.expression)),

      // Level 10: Logical OR (lowest precedence)
      prec.left(1, seq($.expression, "||", $.expression))
    ),

    arguments: $ => sep1($.expression, ","),

    number: $ => /\d+(\.\d+)?/,

    string: $ => seq('"', repeat(choice(/[^"]/, '""')), '"'),
    interpolated_string: $ => seq(
      field("start", "$\""),
      repeat(choice(
        field("text", $.string_text),
        $.interpolation)),
      field("end", "\"")
    ),
    string_text: $ => /[^"{]+/,
    interpolation: $ => seq("{", $.expression, "}"),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    boolean: $ => choice("true", "false"),
  }
});

// helper function for comma-separated lists
function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}
