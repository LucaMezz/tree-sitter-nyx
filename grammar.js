/**
 * @file Parser for the Nyx programming language
 * @author Luca Mezzavilla <lucamezza4@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "nyx",

  externals: $ => [$.newline, $.indent, $.dedent],

  extras: $ => [/\s/, $.comment],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.function_definition,
      $.let_statement,
      $.const_statement,
      $.type_statement,
      $.comment,
    ),

    comment: $ => token(seq("//", /.*/)),

    function_definition: $ => seq(
      "fn",
      $.identifier,
      optional($.generic_parameters),
      "(",
      optional($.parameters),
      ")",
      optional(seq("->", $.type_annotation)),
      ":",
      $.newline,
      $.indent,
      repeat($._statement),
      $.dedent
    ),

    let_statement: $ => seq(
      "let",
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
      $.identifier,
      optional($.generic_parameters),
      "=",
      $.type_annotation,
      $.newline
    ),

    parameters: $ => sep1($.parameter, ","),

    parameter: $ => seq($.identifier, ":", $.type_annotation),

    type_annotation: $ => choice(
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
      $.type_array,
      $.type_ref,
      $.type_ptr,
      $.type_ptr_raw,
      $.named
    ),

    named: $ => seq($.identifier, optional($.generic_arguments)),

    generic_arguments: $ => seq('[', sep1($.type_annotation, ","), ']'),

    generic_parameters: $ => seq('[', sep1($.identifier, ","), ']'),

    type_array: $ => seq("[", optional($.expression), "]", $.type_annotation),
    type_ref: $ => seq("&", $.type_annotation),
    type_ptr: $ => seq("*", $.type_annotation),
    type_ptr_raw: $ => seq("*", "raw"),

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
      $.boolean,
      $.number,
      $.string,
      $.identifier,
      $.call_expression
    ),

    call_expression: $ => seq(
      $.identifier,
      "(",
      optional($.arguments),
      ")"
    ),

    arguments: $ => sep1($.expression, ","),

    number: $ => /\d+(\.\d+)?/,

    string: $ => seq('"', repeat(choice(/[^"]/, '""')), '"'),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    boolean: $ => choice("true", "false"),
  }
});

// helper function for comma-separated lists
function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}
